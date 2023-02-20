from django.core.exceptions import ValidationError


def teacher_model_validate_ltp_preference(preference: str):
    """
    validates that the given string is of the `LTP`, where LTP's ordering can be either
    """
    # string's length should be 3
    if len(preference) != 3:
        raise ValidationError(f"preference length should be 3, but is {len(preference)}")

    preference = preference.upper()

    # make sure preference only contains letters {L,T,P} and no duplicates
    if set(preference) != {"L", "T", "P"}:
        raise ValidationError("preference '%(pref)s' should contain one each of: L, T, P", params={"pref": preference})
