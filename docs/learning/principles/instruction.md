---
title: 指令系统
tags: [计算机组成原理, 指令周期, 指令流水线, 寻址方式]
---

## 指令格式

![指令格式](assets/command/InstructionFormat.png)

### 指令字长度

- 定长指令系统
    
    - 长度固定, 结构 `简单`, 易于译码和顺序寻址
    
    - 平均指令长度大, `冗余` 较多, 不易扩展

- 变长指令系统

    - 长度可变, 结构 `灵活` , 冗余较少, `可扩展` 性好

    - 取指、译码不方便

- 机器字长的关系 `半字长` `单字长` `多字长`

    - 机器字长 `16` 位, 则单字长指令就为 `16` 位, 半字长指令就为 `8` 位

:::info
指令字越长, 占用主存空间越大, 取指速度越慢, 指令字长必须为 2 的 n 次
:::

### 定长操作码

![定长操作码](assets/command/fixedLengthOpcode.png)

- 三地址指令: 两个源操作数 `A1` `A2` 及一个目的操作数 `A3`

- 双地址指令
  
  - `RR型` 操作数均存放在`寄存器(register)` 中(最快)
  
  - `RS型` 源操作数存在寄存器中而目的操作数存放在主存中
  
  - `SS型` 操作数均存放于 `主存(storage)` 中(最慢)

- 单地址指令
  
  - 单目运算 `num += 1`
  
  - 目的操作数为某个 `寄存器`

- 零地址指令
  
  - 空操作指令
  
  - 等待指令
  
  - 停机指令
  
  - 目的操作数为某个 `寄存器`

### 变长操作码

![变长操作码](assets/command/variableLengthopCode.png)

![习题一](assets/command/one.png)

![习题十](./assets/command/ten.png)

## 寻址方式

![习题二](assets/command/two.png)

### 指令寻址(如何获得指令)

- `顺序寻址` 指令在主存中按顺序存放，依次执行

  ![顺序寻址](assets/command/sequentialAddressing.png)

- `跳跃寻址` 收到跳跃指令后跳到特定地址

  ![跳跃寻址](assets/command/jumpAddressing.png)

### 操作数寻址(如何获取被操作的数)

- 立即寻址(操作数在指令中)

  ![立即寻址](assets/command/addressImmediately.png)

  ```
  MOV EAX, 2008H
  ```

- 直接寻址(操作数是主存中的地址)

  ![直接寻址](assets/command/directAddressing.png)

  ```
  MOV EAX, [2008H]
  ```

- 间接寻址

  ![间接寻址](assets/command/indirectAddressing.png)

  ```
  MOV EAX, @2008H
  ```

- 寄存器寻址(操作数在寄存器上)

  ![寄存器寻址](assets/command/registerAddressing.png)

  ```
  MOV EAX, ECX
  ```

- 寄存器间接寻址(操作数的地址在寄存器上)

  ![寄存器间接寻址](assets/command/registerIndirectAddressing.png)

  ```
  MOV AL, [EBX]
  ```

- 相对寻址(取完指令后地址+相对地址)

  ![相对寻址](assets/command/registerAddressing.png)

  ![习题三](assets/command/three.png)

- 变址寻址( `R[x]` 为寄存器中可变部分, 适合 `顺序访问` )

  ![变址寻址](assets/command/IndexedAddressing.png)

  ```
  MOV EAX,32[ESI]
  ```

  ![习题四](assets/command/four.png)

  ![习题九](./assets/command/nine.png)

- 基址寻址(形式地址可变, `R[x]` 不可变)

  ![基址寻址](assets/command/baseAddressing.png)

  ![习题五](assets/command/five.png)

  ![习题八](./assets/command/eight.png)

- 堆栈寻址
  
  - 存储器堆栈

    ![存储器堆栈](assets/command/memoryStack.png)
  
  - 寄存器堆栈

    ![寄存器堆栈](assets/command/registerStack.png)

:::info
寄存器堆栈中数据移动而栈顶固定
:::

## CISC/RISC

### 复杂指令集计算机(CISC)

- 各种功能强大的复杂指令、更多的寻址方式

- 指令格式多, 长度 `不固定`

- 指令数目 `多` 达 200+

- `访存` 指令 `无限制`

- 各种指令使用频率 `差别大`

- 大多采用 `微程序` 控制

### 精简指令集计算机(RISC)

- `80-20` 定律, `80%` 的程序只用了 `20%` 的指令

- 选取 `使用频率最高` 的简单指令

- 对访存指令做了限制, 只允许 LOAD/STORE 指令访问主存, 其他都只能 `操作寄存器`

- 指令 `长度固定`

- 采用 `指令流水线` 技术

- 采用硬布线控制为主

- 有利于编译程序代码优化

## 指令流水线

![指令流水](assets/command/InstructionPipeline.png)

### 利于实现指令流水的特征

1. 指令长度尽量一致, 利于简化取指令和指令译码操作

2. 指令格式尽量规整, 保证源寄存器 `位置相同`, 有利于在 `指令未知` 时可以取寄存器操作数, 否则 `需译码` 后才能确定指令中各寄存器编号的位置

3. 采用 `load/store` 指令, 可以把地址计算和运算指令的执行规整到 `同一周期`

4. 数据和指令在存储器中 `对齐` 存放, 有利于 `减少访存` 次数

### 多指令执行方式

- 顺序执行

  ![顺序执行](assets/command/sequentialExecution.png)

- 一次重叠

  ![一次重叠](assets/command/oneOverlap.png)

- 二次重叠

  ![二次重叠](assets/command/secondaryOverlap.png)

### 表示方法

![指令流水表示方法](assets/command/InstructionPipelineRepresentationMethod.png)

### 影响因素

1. 结构冲突 `结构冒险`
   
   - 多条指令在同一时刻竞争同一资源
   
   - 采用 `独立` 的指令存储器和数据存储器
   
   - 使后一条指令 `暂停` 一个时钟周期, 但会造成 `性能损失`

2. 数据冲突 `数据冒险`

   - 当前指令需要 `之前指令` 的数据, 但之前指令的数据又 `没有生成/传过来`

   - 遇到数据冲突时 `暂停` 几个时钟周期

   - 设置一条 `专线` , 数据不用写入寄存器, 而是直接作为下一条指令 `输入`

   - `编译优化` , 调整指令执行顺序

   ![习题六](assets/command/six.png)

3. 控制冲突

   - 程序执行转移类指令(无条件转移、条件转移、子程序调用、中断等)引起的冲突

   - 执行中可能改变程序的方向, 从而造成流水线 `断流`

   - 对转移指令进行 `分支预测` , 尽早生产转移目标地址

   - 提高转移方向的 `猜准率`

   - `提前取出` 转移成功和不成功方向上的指令

### 性能指标

- `吞吐率` 单位时间完成的任务数

  ![吞吐率](assets/command/throughput.png)

  ![习题七](assets/command/seven.png)

- `加速比` 不使用流水线时间/使用流水线时间

  ![加速比](assets/command/speedupRatio.png)

- `效率` 单位指令加速比
  
  ![效率](assets/command/efficiency.png)

## 指令周期

- `取指周期` 从主存中取出指令, 并计算后续指令地址

- `译码/取操作数周期(间址周期)` 根据指令地址码生成操作数有效地址, 访问相应内存单元(只对 `操作码` 进行译码)

- `执行周期` 对取出的操作数进行加工, 将处理状态记录到程序的 `状态寄存器` 中

- `写回周期` 运算结果写回到目的寄存器或存储器中

:::info
还可能存在

- `中断周期` 当前程序和中断处理程序的切换

- `总线周期` 总线操作与总线控制权转移

- `I/O周期` 输入输出操作

:::

![指令周期](./assets/command/InstructionCycle.png)