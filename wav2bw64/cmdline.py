import argparse
from argparse import RawTextHelpFormatter


def parse_command_line():
    parser = argparse.ArgumentParser(description="wav2adm",
                                     formatter_class=RawTextHelpFormatter)

    parser.add_argument("input_file")
    parser.add_argument("output_file")
    parser.add_argument("adm", help="YAML File to define ADM chunk for WAV file. See adm.yaml for example.")
    parser.add_argument("-d",
                        "--debug",
                        help="print debug information when an error occurs",
                        action="store_true")

    args = parser.parse_args()
    return args
