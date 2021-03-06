<?php

namespace App\Services;

use App\Models\Token;

class TokenService
{

    public function oneByValue($value, $action, array $with = [])
    {
        return Token::query()
            ->with($with)
            ->where(['value' => $value, 'action' => $action])
            ->first();
    }

    public function oneByUserId($userId, $action, array $with = [], $orNew = false)
    {
        $token = Token::query()
            ->where(['user_id' => $userId, 'action' => $action])
            ->first();

        if (!$token && $orNew) {
            $token = $this->create($userId, $action);
        }

        return $token ? $token->load($with) : null;
    }

    public function create($userId, string $action, string $value = null)
    {
        $token = Token::make([
            'user_id' => $userId,
            'action' => $action,
            'value' => $value ?? $this->value()
        ]);

        return $token->save() ? $token : null;
    }

    public function refresh($userId, string $action)
    {
        if ($token = $this->oneByUserId($userId, $action)) {
            try {
                $token->delete();
            } catch (\Exception $e) {
                return false;
            }
        }

        return $this->create($userId, $action);
    }

    public function value(int $length = 33)
    {
        return sha1(str_random($length));
    }
}