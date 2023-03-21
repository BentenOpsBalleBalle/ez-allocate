import codecs
import csv
import io


class CSVExportHandler:
    """
    This exporter class stores the csv file in memory and its methods and
    properties in one place

    uses BytesIO to store utf-8 encoded csv file

    source: https://stackoverflow.com/a/55997159
    """
    fieldnames = ["Subject", "Teacher"]

    def __init__(self, fieldnames=None, codec="utf-8") -> None:
        self.bio = io.BytesIO()
        self.__StreamWriter = codecs.getwriter(codec)
        self.wrapper_file = self.__StreamWriter(self.bio)
        self.writer = None
        self.fieldnames = fieldnames or self.fieldnames

    def get_csv_dict_writer(self):
        self.writer = csv.DictWriter(self.wrapper_file, fieldnames=self.fieldnames)
        return self.writer

    def to_file(self, filename="test.csv"):
        """
        writes BytesIO to a file, method intended only for testing purpose
        """
        with open(filename, "wb") as f:
            f.write(self.bio.getvalue())
