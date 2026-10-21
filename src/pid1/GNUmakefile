CROSS_COMPILE ?= 
INIT_PATH ?= /init2
OUT_PATH ?= target/init 

CC := $(CROSS_COMPILE)gcc

$(OUT_PATH): main.c
	$(CC) $^ -static -ffreestanding -nostartfiles -nostdlib -DINIT_PATH=\"$(INIT_PATH)\" -o $@
