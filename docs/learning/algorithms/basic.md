---
title: 基础知识
tags: []
---

## 渐进的界

### O(n)

若 `存在` 正数 $c$ 和 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le f(n) \le cg(n)$ , 则 $f(n)$ 的渐进上界为 $g(n)$ , 记为 $f(n)=O(g(n))$

### Ω(n)

若 `存在` 正数 $c$ 和 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le cg(n) \le f(n)$ , 则 $f(n)$ 的渐进下界为 $g(n)$ , 记为 $f(n)=\Omega(g(n))$

:::info

$f(n)=n^2+n$

:::

### o(n)

若对 `任意` 正数 $c$ 都存在 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le f(n) \lt cg(n)$ , 记为 $f(n) = o(g(n))$

### ω(n)

若对 `任意` 正数 $c$ 都存在 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le cg(n) \lt f(n)$ , 记作 $f(n) = \omega(g(n))$

### Θ(n)

`上下界`

若 $f(n)=O(g(n))$ 且 $f(n)=\Omega(g(n))$ , 记作 $f(n) = \Theta(g(n))$
