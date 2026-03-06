from rest_framework.response import Response


def api_success(data=None, message="Success", status_code=200):
    return Response(
        {
            "success": True,
            "data": data if data is not None else {},
            "message": message,
        },
        status=status_code,
    )


def api_error(message="Request failed", errors=None, status_code=400):
    payload = {
        "success": False,
        "data": {},
        "message": message,
        "error": message,
    }
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=status_code)
