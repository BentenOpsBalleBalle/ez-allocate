from common_models.models import Allotment

from .csv_exporter import CSVExportHandler
from .export_format import CSVFormat_v1, CSVFormatTeacher_v1


def convert_to_csv_v1():
    """
    Converts the entire allotment into a csv file
    and then returns the class handling the in-memory BytesIO
    """
    FORMAT = CSVFormat_v1()
    CSV_HANDLER = CSVExportHandler(fieldnames=FORMAT.fieldnames)

    allotments = get_sorted_queryset()

    writer = CSV_HANDLER.get_csv_dict_writer()
    writer.writeheader()

    for allotment in allotments:
        writer.writerow(FORMAT.get_row(allotment))

    return CSV_HANDLER


def convert_allotments_to_csv_teacher_v1():
    """
    Converts the entire allotment from teacher's side into a csv file and
    returns the class containing the BytesIO instance
    """
    FORMAT = CSVFormatTeacher_v1()
    CSV_HANDLER = CSVExportHandler(fieldnames=FORMAT.fieldnames)

    allotments_teacher = get_sorted_queryset(by_teacher=True)

    writer = CSV_HANDLER.get_csv_dict_writer()
    writer.writeheader()

    for allotment in allotments_teacher:
        writer.writerow(FORMAT.get_row(allotment))

    return CSV_HANDLER


def get_sorted_queryset(by_teacher=False):
    """
    get allotment entries ordered by:
        - subject name
        - lecture hours descending,
        - tutorial descending
        - practical descending
    """
    return Allotment.objects.all().order_by(
        "teacher__name" if by_teacher else "subject__name",
        "-allotted_lecture_hours",
        "-allotted_tutorial_hours",
        "-allotted_practical_hours",
    )
