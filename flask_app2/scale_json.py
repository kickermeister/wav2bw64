import json
import numpy as np


def scale_json(filename):
    with open(filename, "r") as f:
        file_content = f.read()

    json_content = json.loads(file_content)
    data = json_content["data"]
    # number of decimals to use when rounding the peak value
    digits = 2

    max_val = float(max(data))
    new_data = []
    for x in data:
        new_data.append(round(x / max_val, digits))

    deinterleaved_data = deinterleave(new_data, json_content["channels"])
    json_content["data"] = deinterleaved_data
    file_content = json.dumps(json_content, separators=(',', ':'))

    with open(filename, "w") as f:
        f.write(file_content)


def deinterleave(data, channelCount):
    deinterleaved = [np.array(data)[idx::channelCount * 2] for idx in range(channelCount * 2)]
    new_data = []
    for ch in range(channelCount):
        idx1 = 2 * ch
        idx2 = 2 * ch + 1
        ch_data = [None] * (len(deinterleaved[idx1]) + len(deinterleaved[idx2]))
        ch_data[::2] = deinterleaved[idx1]
        ch_data[1::2] = deinterleaved[idx2]
        new_data.append(ch_data)
    return new_data
