<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $e)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            $response = [
                'code' => 'SERVER_ERROR',
                'message' => $e->getMessage(),
            ];
            $status = 500;

            if ($e instanceof AuthenticationException) {
                $status = 401;
                $response['code'] = 'UNAUTHORIZED';
                $response['message'] = 'Unauthenticated.';
            } elseif ($e instanceof AuthorizationException) {
                $status = 403;
                $response['code'] = 'FORBIDDEN';
                $response['message'] = 'This action is unauthorized.';
            } elseif ($e instanceof ThrottleRequestsException) {
                $status = 429;
                $response['code'] = 'QUOTA_EXCEEDED';
                $response['message'] = 'Too many requests.';
            } elseif ($e instanceof HttpException) {
                $status = $e->getStatusCode();
                $response['code'] = $status === 404 ? 'NOT_FOUND' : 'HTTP_ERROR';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $status = 422;
                $response['code'] = 'VALIDATION_ERROR';
                $response['message'] = 'The given data was invalid.';
                $response['errors'] = $e->errors();
                $response['meta'] = ['errors' => $e->errors()];
            }

            return response()->json($response, $status);
        }

        return parent::render($request, $e);
    }
}
