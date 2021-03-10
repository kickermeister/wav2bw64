from setuptools import find_packages, setup

setup(
    name='wav2bw64',
    description='Add basic ADM Metadata to WAV file and export as BW64',
    version='0.1.0',
    license='BSD-3-Clause',
    long_description=open('README.md').read() + '\n' + open('CHANGELOG.md').read(),
    long_description_content_type='text/markdown',
    install_requires=[
        'ear~=2.0.0',
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
            'wav2bw64 = wav2bw64.main:main'
        ]
    },
)
