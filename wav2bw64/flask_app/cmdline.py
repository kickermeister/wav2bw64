import argparse
from argparse import RawTextHelpFormatter


def parse_command_line():
    parser = argparse.ArgumentParser(description="adm_author",
                                     formatter_class=RawTextHelpFormatter)

    parser.add_argument("--host", help="Host IP adress (default: 127.0.0.1)", default="127.0.0.1")
    parser.add_argument("--port", help="Port for host (default: 8080)", default=8080)
    parser.add_argument("-u", "--upload_limit", help="Permitted upload size in MB for wav files (default: 4000 MB)", default=4000, type=int)
    parser.add_argument("--debug",
                        help="Log debug information",
                        action="store_true")

    args = parser.parse_args()
    return args

