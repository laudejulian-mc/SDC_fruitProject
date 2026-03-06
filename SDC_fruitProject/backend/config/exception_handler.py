from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return response

    message = "Request failed"
    errors = response.data

    if isinstance(response.data, dict):
        if "detail" in response.data:
            message = str(response.data.get("detail"))
        elif "non_field_errors" in response.data:
            first = response.data.get("non_field_errors")
            if isinstance(first, list) and first:
                message = str(first[0])
        else:
            first_key = next(iter(response.data.keys()), None)
            if first_key:
                first_value = response.data[first_key]
                if isinstance(first_value, list) and first_value:
                    message = str(first_value[0])
                else:
                    message = str(first_value)
    elif isinstance(response.data, list) and response.data:
        message = str(response.data[0])

    response.data = {
        "success": False,
        "data": {},
        "message": message,
        "errors": errors,
    }
    return response
