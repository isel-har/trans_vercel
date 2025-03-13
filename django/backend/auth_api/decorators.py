from rest_framework.response import Response

class BlackListToken:
    tokens_dict = {} ## class level variable (static variable)
    @classmethod           ## class class method
    def is_blacklisted(cls, api_view):
        
        def wrapped_view(request, *args, **kwargs):
            user_id = request.user.id
            header = request.headers.get('Authorization')
            token = header.split()[1]
            token_set = cls.tokens_dict.get(user_id, None)
            if token_set != None:
                if token in cls.tokens_dict[user_id]:
                    return Response({'error' : 'invalid token (blacklisted token)'}, status=401)

            return api_view(request, *args, **kwargs)
        return wrapped_view

    @classmethod
    def add_token(cls, user_id, header):

        token = header.split()[1]
        user_tokens = cls.tokens_dict.get(user_id, None)
        if user_tokens == None:
            cls.tokens_dict[user_id] = set()
            cls.tokens_dict[user_id].add(token)
            return
        user_tokens.add(token)

    @classmethod
    def check_token(cls, user_id, token, raise_exception=False):
        user_tokens = cls.tokens_dict.get(user_id, None)
        if user_tokens is not None:
            found =  token in user_tokens
            if found and raise_exception:
                raise Exception("blacklisted token")
            return found

        return False