import sys
import logging
from .fileio import generate_bw64_file, load_adm_yaml_file
from .cmdline import parse_command_line


def main():
    args = parse_command_line()
    if args.debug is True:
        logging.basicConfig(level=logging.DEBUG)
    adm_dict = load_adm_yaml_file(args.adm)
    _ = generate_bw64_file(args.input_file,
                           args.output_file,
                           adm_dict)
    sys.exit()


if __name__ == "__main__":
    main()
