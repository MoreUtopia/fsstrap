typedef signed char int8;
typedef unsigned char uint8;

typedef signed short int16;
typedef unsigned short uint16;

typedef signed int int32;
typedef unsigned int uint32;

typedef signed long long int64;
typedef unsigned long long uint64;

typedef unsigned long size_t;
typedef unsigned long uintptr_t;  
typedef signed long   intptr_t;

typedef void (*function_ptr)();

typedef signed char int8_t; 
typedef unsigned char uint8_t;

typedef signed short int16_t; 
typedef unsigned short uint16_t;

typedef signed int int32_t;
typedef unsigned int uint32_t;

typedef signed long long int64_t;
typedef unsigned long long uint64_t;

#if defined(__x86_64__)

#define __LIBC_SYSCALL_REG0 "rax"
#define __LIBC_SYSCALL_ASM_REG0 "a"

#define __LIBC_SYSCALL_REG1 "rdx"
#define __LIBC_SYSCALL_ASM_REG1 "d"

#define __LIBC_SYSCALL_REG2 "rdi"
#define __LIBC_SYSCALL_ASM_REG2 "D"

#define __LIBC_SYSCALL_REG3 "rsi"
#define __LIBC_SYSCALL_ASM_REG3 "S"

#define __LIBC_SYSCALL_REG4 "r10"
#define __LIBC_SYSCALL_ASM_REG4 "r"

#define __LIBC_SYSCALL_REG5 "r8"
#define __LIBC_SYSCALL_ASM_REG5 "r"

#define __LIBC_SYSCALL_REG6 "r9"
#define __LIBC_SYSCALL_ASM_REG6 "r"

#define __LIBC_LOSS_REGISTERS "rcx", "r11"
#define __LIBC_SYSCALL_INSTRUCTION "syscall"

#elif defined(__riscv) && (__riscv_xlen == 64)

#define __LIBC_SYSCALL_REG0 "a0"
#define __LIBC_SYSCALL_ASM_REG0 "r"

#define __LIBC_SYSCALL_REG1 "a1"
#define __LIBC_SYSCALL_ASM_REG1 "r"

#define __LIBC_SYSCALL_REG2 "a2"
#define __LIBC_SYSCALL_ASM_REG2 "r"

#define __LIBC_SYSCALL_REG3 "a3"
#define __LIBC_SYSCALL_ASM_REG3 "r"

#define __LIBC_SYSCALL_REG4 "a4"
#define __LIBC_SYSCALL_ASM_REG4 "r"

#define __LIBC_SYSCALL_REG5 "a5"
#define __LIBC_SYSCALL_ASM_REG5 "r"

#define __LIBC_SYSCALL_REG6 "a7"
#define __LIBC_SYSCALL_ASM_REG6 "r"

#define __LIBC_LOSS_REGISTERS "a6"
#define __LIBC_SYSCALL_INSTRUCTION "ecall"

#endif

#ifndef INIT_PATH
#define INIT_PATH "/init2"
#endif

static inline uint64_t __libc_syscall0(uint64_t syscall_no) {
    register uint64_t ret asm(__LIBC_SYSCALL_REG0) = syscall_no;

    asm volatile (
        __LIBC_SYSCALL_INSTRUCTION
        : "=" __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_LOSS_REGISTERS, "memory"
    );

    return ret;
}

static inline uint64_t __libc_syscall1(
    uint64_t syscall_no,
    uint64_t arg1
) {
    register uint64_t ret asm(__LIBC_SYSCALL_REG0) = syscall_no;
    register uint64_t a1  asm(__LIBC_SYSCALL_REG1) = arg1;

    asm volatile (
        __LIBC_SYSCALL_INSTRUCTION
        : "+" __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_SYSCALL_ASM_REG1 (a1)
        : __LIBC_LOSS_REGISTERS, "memory"
    );

    return ret;
}

static inline uint64_t __libc_syscall2(
    uint64_t syscall_no,
    uint64_t arg1,
    uint64_t arg2
) {
    register uint64_t ret asm(__LIBC_SYSCALL_REG0) = syscall_no;
    register uint64_t a1  asm(__LIBC_SYSCALL_REG1) = arg1;
    register uint64_t a2  asm(__LIBC_SYSCALL_REG2) = arg2;

    asm volatile (
        __LIBC_SYSCALL_INSTRUCTION
        : "+" __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_SYSCALL_ASM_REG1 (a1),
          __LIBC_SYSCALL_ASM_REG2 (a2)
        : __LIBC_LOSS_REGISTERS, "memory"
    );

    return ret;
}

static inline uint64_t __libc_syscall3(
    uint64_t syscall_no,
    uint64_t arg1,
    uint64_t arg2,
    uint64_t arg3
) {
    register uint64_t ret asm(__LIBC_SYSCALL_REG0) = syscall_no;
    register uint64_t a1  asm(__LIBC_SYSCALL_REG1) = arg1;
    register uint64_t a2  asm(__LIBC_SYSCALL_REG2) = arg2;
    register uint64_t a3  asm(__LIBC_SYSCALL_REG3) = arg3;

    asm volatile (
        __LIBC_SYSCALL_INSTRUCTION
        : "+" __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_SYSCALL_ASM_REG1 (a1),
          __LIBC_SYSCALL_ASM_REG2 (a2),
          __LIBC_SYSCALL_ASM_REG3 (a3)
        : __LIBC_LOSS_REGISTERS, "memory"
    );

    return ret;
}

static inline uint64_t __libc_syscall4(
    uint64_t syscall_no,
    uint64_t arg1,
    uint64_t arg2,
    uint64_t arg3,
    uint64_t arg4
) {
    register uint64_t ret asm(__LIBC_SYSCALL_REG0) = syscall_no;
    register uint64_t a1  asm(__LIBC_SYSCALL_REG1) = arg1;
    register uint64_t a2  asm(__LIBC_SYSCALL_REG2) = arg2;
    register uint64_t a3  asm(__LIBC_SYSCALL_REG3) = arg3;
    register uint64_t a4  asm(__LIBC_SYSCALL_REG4) = arg4;

    asm volatile (
        __LIBC_SYSCALL_INSTRUCTION
        : "+" __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_SYSCALL_ASM_REG1 (a1),
          __LIBC_SYSCALL_ASM_REG2 (a2),
          __LIBC_SYSCALL_ASM_REG3 (a3),
          __LIBC_SYSCALL_ASM_REG4 (a4)
        : __LIBC_LOSS_REGISTERS, "memory"
    );

    return ret;
}

static inline uint64_t __libc_syscall5(
    uint64_t syscall_no,
    uint64_t arg1,
    uint64_t arg2,
    uint64_t arg3,
    uint64_t arg4,
    uint64_t arg5
) {
    register uint64_t ret asm(__LIBC_SYSCALL_REG0) = syscall_no;
    register uint64_t a1  asm(__LIBC_SYSCALL_REG1) = arg1;
    register uint64_t a2  asm(__LIBC_SYSCALL_REG2) = arg2;
    register uint64_t a3  asm(__LIBC_SYSCALL_REG3) = arg3;
    register uint64_t a4  asm(__LIBC_SYSCALL_REG4) = arg4;
    register uint64_t a5  asm(__LIBC_SYSCALL_REG5) = arg5;

    asm volatile (
        __LIBC_SYSCALL_INSTRUCTION
        : "+" __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_SYSCALL_ASM_REG1 (a1),
          __LIBC_SYSCALL_ASM_REG2 (a2),
          __LIBC_SYSCALL_ASM_REG3 (a3),
          __LIBC_SYSCALL_ASM_REG4 (a4),
          __LIBC_SYSCALL_ASM_REG5 (a5)
        : __LIBC_LOSS_REGISTERS, "memory"
    );

    return ret;
}

static inline uint64_t __libc_syscall6(
    uint64_t syscall_no,
    uint64_t arg1,
    uint64_t arg2,
    uint64_t arg3,
    uint64_t arg4,
    uint64_t arg5,
    uint64_t arg6
) {
    register uint64_t ret asm(__LIBC_SYSCALL_REG0) = syscall_no;
    register uint64_t a1  asm(__LIBC_SYSCALL_REG1) = arg1;
    register uint64_t a2  asm(__LIBC_SYSCALL_REG2) = arg2;
    register uint64_t a3  asm(__LIBC_SYSCALL_REG3) = arg3;
    register uint64_t a4  asm(__LIBC_SYSCALL_REG4) = arg4;
    register uint64_t a5  asm(__LIBC_SYSCALL_REG5) = arg5;
    register uint64_t a6  asm(__LIBC_SYSCALL_REG6) = arg6;

    asm volatile (
        __LIBC_SYSCALL_INSTRUCTION
        : "+" __LIBC_SYSCALL_ASM_REG0 (ret)
        : __LIBC_SYSCALL_ASM_REG1 (a1),
          __LIBC_SYSCALL_ASM_REG2 (a2),
          __LIBC_SYSCALL_ASM_REG3 (a3),
          __LIBC_SYSCALL_ASM_REG4 (a4),
          __LIBC_SYSCALL_ASM_REG5 (a5),
          __LIBC_SYSCALL_ASM_REG6 (a6)
        : __LIBC_LOSS_REGISTERS, "memory"
    );

    return ret;
}

void _start() {
    char* shit = "launching shell\n";
    char* init_path = INIT_PATH;
    __libc_syscall3(5, 2, (uintptr_t)shit, 16);
    __libc_syscall2(2001, (uintptr_t)init_path, 1);
    while (1) continue;
} 
