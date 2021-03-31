from setuptools import find_packages, setup

setup(
    name='wav2bw64',
    description='Add basic ADM Metadata to WAV file and export as BW64',
    version='0.1.0',
    license='BSD-3-Clause',
    long_description=open('README.md').read() + '\n' + open('CHANGELOG.md').read(),
    long_description_content_type='text/markdown',
    include_package_data=True,
    install_requires=[
        'ear @ git+https://github.com/kickermeister/ebu_adm_renderer.git@feature_loudness',
        'wavinfo~=1.6.2',
        'Flask==1.1.2'
    ],
    extras_require={
        'test': [],
        'dev': []
    },
    packages=find_packages(),
    package_data={
    },
    entry_points={
        'console_scripts': [
            'wav2bw64 = wav2bw64.main:main',
            'adm_author = wav2bw64.flask_app.app:main'
        ]
    },
)
