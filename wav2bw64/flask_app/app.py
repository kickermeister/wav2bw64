import os
import sys
import subprocess
import json
from flask import Flask, flash, request, redirect, url_for, send_from_directory, render_template, jsonify
from werkzeug.utils import secure_filename
from ear.core import bs2051
from scale_json import scale_json
sys.path.append("../")
from fileio import get_wav_info, generate_bw64_file

UPLOAD_FOLDER = 'uploads'

app = Flask(__name__)
"""            static_url_path='',
            static_folder='web/static',
            template_folder='web/templates')
"""
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 512 * 1024 * 1024


# Path for our main Svelte page
@app.route("/", methods=['GET', 'POST'])
def base():
    if request.method == 'POST':
        print("POST METHOD RECEIVED!")
        print("FILE UPLOADED: ", request.files['file'].filename)
        # check if the post request has the file part
        if 'file' not in request.files:
            print('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            print('No selected file')
            return redirect(request.url)
        else:
            print("File uploading")
            filename = secure_filename(file.filename)
            os.mkdir(UPLOAD_FOLDER)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            wav_info = get_wav_info(path)
            print(wav_info)
            return jsonify({'path': path, 'filename': filename, 'wav_info': wav_info})
    return send_from_directory('../svelte_app/public/', 'index.html')

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('../svelte_app/public/', path)

@app.route('/show_wav_info/<filename>')
def show_wav_info(filename):
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    wav_info = get_wav_info(path)
    return render_template('wav-info.html',
                           path=path,
                           filename=filename,
                           wav_info=wav_info)

@app.route('/render_waveform', methods=['POST', 'GET'])
def render_waveform():
    print(request.form)
    filename = request.form['filename']
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    wav_info = get_wav_info(path)
    if wav_info["Channels"] > 8:
        return 'Waveform rendering supported only for WAV files with up to 8 channels', 400
    else:
        jsonpath = os.path.splitext(path)[0] + '.json'
        cmd = ["audiowaveform", "-i", path, "-o", jsonpath, "--pixels-per-second", "30", "--bits", "8", "--split-channels"]
        _ = subprocess.run(cmd)
        scale_json(jsonpath)
        return jsonify({"jsonpath": jsonpath})

@app.route('/uploads/<filename>')
def uploads(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

@app.route("/set_bw64_config", methods=['POST'])
def set_bw64_config():
    print(request.form)
    in_wav_path = request.form['in_wav_path']
    out_bwav_path = request.form['out_bwav_path']
    adm_dict = json.loads(request.form['adm_dict'])
    res = generate_bw64_file(in_wav_path, out_bwav_path, adm_dict)
    if res is True:
        out_bwav = out_bwav_path.rsplit('/', 1)[-1]
        return jsonify({'bw64_file': UPLOAD_FOLDER + "/" + out_bwav})
    else:
        return 'Something went wrong!', 400


if __name__ == '__main__':
    app.secret_key = 'super secret key'
    app.run(debug=True, port=8080)
