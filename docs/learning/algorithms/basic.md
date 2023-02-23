---
title: 基础知识
tags: [渐进]
---

## 渐进的界

### O(n)

若 `存在` 正数 $c$ 和 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le f(n) \le cg(n)$ , 则 $f(n)$ 的渐进上界为 $g(n)$ , 记为 $f(n)=O(g(n))$

:::info 例题

$f(n) = n^2 + n$

当 $c=2$ , $n_0 = 1$ 时, $f(n) = O(n^2)$

当 $c=1$ , $n_0 = 2$ 时, $f(n) = O(n^3)$

:::

### Ω(n)

若 `存在` 正数 $c$ 和 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le cg(n) \le f(n)$ , 则 $f(n)$ 的渐进下界为 $g(n)$ , 记为 $f(n)=\Omega(g(n))$

:::info 例题

$f(n) = n^2 + n$

当 $c=1$ , $n_0 = 1$ 时, $f(n) = \Omega(n^2)$

:::

### o(n)

若对 `任意` 正数 $c$ 都存在 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le f(n) \lt cg(n)$ , 记为 $f(n) = o(g(n))$

:::info 例题

$f(n) = n^2 + n$

当 $c\ge 1$ 时, 存在 $n_0=2$ , 使得 $n^2+n\lt cn^3$

当 $0 \lt c \lt 1$ 时, 取 $n_0 \gt \lceil 2/c \rceil$, 使得 $cn \ge cn_0 \gt 2$ , 而 $n^2+n \lt 2n^2 \le cn^3$

因此 $f(n) = o(n^3)$

:::

### ω(n)

若对 `任意` 正数 $c$ 都存在 $n_0$ , 使得一切 $n \ge n_0$ 都有 $0 \le cg(n) \lt f(n)$ , 记作 $f(n) = \omega(g(n))$

:::info 例题

$f(n) = n^2 + n$

$f(n) = \omega(n)$ , $f(n) \neq \omega(n^2)$ , 因为当 $c=2$ 时, 不存在 $n_0$ 使得一切 $n \ge n_0$ 都有 $2n^2 \lt n^2 + n$

:::

### Θ(n)

`上下界`

若 $f(n)=O(g(n))$ 且 $f(n)=\Omega(g(n))$ , 记作 $f(n) = \Theta(g(n))$

:::info 例子

$f(n) = n^2 + n$ , 则 $f(n) = \Theta(100n^2)$

当 $c=1/100$ 且 $n_0 = 1$ 时, $f(n)=\Omega(n^2)$

当 $c=1/50$ 且 $n_0 = 1$ 时, $f(n)=O(n^2)$

:::

## 定理

- 如果 $\lim\limits_{n\rightarrow\infty}\frac{f(n)}{g(n)}$ 存在, 且等于某个常数, 则 $f(n) = \Theta(g(n))$

  :::info 证明

  给定正数 $\varepsilon=c/2$ , 根据极限的定义, 则
  
  $$
    \left|\frac{f(n)}{g(n)} - c\right|\le \varepsilon
  $$

  $$

    c - \varepsilon \lt \frac{f(n)}{g(n)} \lt c - \varepsilon

  $$

  $$

    \frac{c}{2} \lt \frac{f(n)}{g(n)} \lt \frac{3c}{2} \lt 2c

  $$

  因此存在 $f(n) \le 2cg(n)$ 以及 $f(n) \ge \frac{c}{2}g(n)$

  :::

  :::info 例题

  $f(n) = \frac{1}{2}n^2-3n$ , 证明 $f(n) = \Theta(n^2)$

  因为 $\lim\limits_{n\rightarrow\infty}\frac{f(n)}{n^2}=\lim\limits_{n\rightarrow\infty}\frac{\frac{1}{2}n^2-3n}{n^2}=\frac{1}{2}$ , 因此 $f(n) = \Theta(n^2)$

  :::

- 如果 $\lim\limits_{n\rightarrow\infty}\frac{f(n)}{g(n)} = 0$ , 则 $f(n) = o(g(n))$

- 如果 $\lim\limits_{n\rightarrow\infty}\frac{f(n)}{g(n)} = +\infty$, 则 $f(n) = \omega(g(n))$

- 如果 $f=O(g)$ 且 $g=O(h)$ , 则 $f=O(h)$

- 如果 $f=\Omega(g)$ 且 $g=\Omega(h)$ , 则 $f=\Omega(h)$

- 如果 $f=\Theta(g)$ 且 $g=\Theta(h)$ , 则 $f=\Theta(h)$

- 幂函数的阶数小于指数函数

  $$
    n^d=o(r^n), r \lt 1 , d \lt 0 
  $$

  :::info 证明

  $$
  \lim\limits_{n\rightarrow\infty}\frac{n^d}{r^n}
  
  =\lim\limits_{n\rightarrow\infty}\frac{dn^{d-1}}{r^nlnr}

  = \lim\limits_{n\rightarrow\infty}\frac{d!}{r^n(lnr)^d} = 0

  $$

  :::

- 多项式 $f(n)=a_0+a_1n+a_2n^2+\cdots+a_dn^d$ 存在

  - $f(n) = \Omega(n^d)$

  - $f(n) = O(n^d)$

  - $f(n) = \Theta(n^d)$

- 对数函数存在

  - $log_bn = o(n^\alpha), \alpha\gt 0$

    :::info 证明
    $$
    \lim\limits_{n\rightarrow\infty}\frac{log_bn}{n^\alpha}
  
    =\lim\limits_{n\rightarrow\infty}\frac{lnn}{n^\alpha lnb}

    =\lim\limits_{n\rightarrow\infty}\frac{1/n}{\alpha n^{\alpha-1}lnb}

    =\lim\limits_{n\rightarrow\infty}\frac{1}{\alpha n^\alpha lnb}

    =0

    $$
    :::

  - $log_kn = \Theta(log_ln)$

    :::info 证明
    $$
    \lim\limits_{n\rightarrow\infty}\frac{log_kn}{log_ln}

    =\lim\limits_{n\rightarrow\infty}\frac{log_ln}{log_lk·log_ln}

    = \frac{1}{log_lk}
    $$
    :::

- 阶乘

  - `stirling 公式`

    $$
    n!=\sqrt{2\pi n}\left(\frac{n}{e}\right)^n\left(1+\Theta\left(\frac{1}{n}\right)\right)
    $$

  - $n!=o(n^n)$

  - $n!=\omega(2^n)$

  - $log(n!)=\Theta(nlogn)$

    :::info 证明
    $$
    \lim\limits_{n\rightarrow\infty}\frac{log(n!)}{nlogn}=1
    $$
    :::

- 求和公式

  $$
  \sum_{k=1}^na_k=\frac{n(a_1+a_n)}{2}
  $$

  $$
  \sum_{k=0}^n aq^k=\frac{a(1-q^{n+1})}{1-q}
  $$

  - 假设存在常数 $r \lt 1$ , 使得一切 $k \ge 0$ , $\frac{a_{k+1}}{a_k} \le r$ 成立 , 则

    $$
    \sum_{k=0}^na_k 
    
    \le \sum_{k=0}^\infty a_0r^k

    =a_0\sum_{k=0}^\infty r^k

    =\frac{a_0}{1-r}

    $$

    :::info 例题
    估计 $\sum_{k=1}^n\frac{k}{3^k}$ 的上界

    $a_k=\frac{k}{3^k}$ , $a_{k+1}=\frac{k+1}{3^{k+1}}$

    $\frac{a_{k+1}}{a_k}=\frac{k+1}{3k}\le\frac{2}{3}$

    $\sum_{k=1}^n\frac{k}{3^k}\le\sum_{k=1}^\infty a_1r^{k-1}=\frac{\frac{1}{3}}{1-\frac{2}{3}}=1$

    :::