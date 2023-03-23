from abc import ABC, abstractmethod
from typing import List

from common_models.models import Allotment


class AbstractFileFormat(ABC):
    """
    This abstract class defines the different ways hardcoded formats can be
    defined in future classes/formats inheriting this base class
    """
    fieldnames = []

    def __init__(self) -> None:
        super().__init__()
        self.fieldnames = self._set_field_format()

    @abstractmethod
    def _set_field_format(self) -> List[str]:
        """
        This method defines the format that will be used in the csv file
        """
        pass

    @abstractmethod
    def _make_dict_row(self, allotment: Allotment):
        """
        This method generates a row for the given format.
        returns a dictionary with value for each field
        """
        pass

    def get_row(self, allotment: Allotment):
        """
        Returns the row compatible with the set format.
        raises a
        """
        row = self._make_dict_row(allotment)
        try:
            assert set(row.keys()) == set(self.fieldnames)
        except AssertionError:
            raise NotImplementedError(
                "_make_dict_row() not correctly implemented"
                f"expected keys: {self.fieldnames}, got: {row.keys()}"
            )
        else:
            return row


class CSVFormat_v1(AbstractFileFormat):
    """
    This v1 format will be used to export the allotments in the following format:
        - Subject
        - Faculty
        - L
        - T
        - P
        - Total
    """

    def _set_field_format(self) -> List[str]:
        return ["Subject", "Faculty", "L", "T", "P", "Total"]

    def _make_dict_row(self, allotment: Allotment):
        return {
            "Subject": allotment.subject.repr_csv(),
            "Faculty": str(allotment.teacher),
            "L": allotment.allotted_lecture_hours,
            "T": allotment.allotted_tutorial_hours,
            "P": allotment.allotted_practical_hours,
            "Total": allotment.get_allotment_total_hours()
        }
