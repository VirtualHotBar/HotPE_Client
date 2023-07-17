### 解除占用(数据分区强制分配盘符)
PartAssist.exe /hd:4 /setletter:0 /letter:*
PartAssist.exe /hd:4 /setletter:0 /letter:auto

### 删除磁盘所有分区

还原磁盘为普通模式（删除fbinst引导记录）:fbplus.exe (hd4) format --force --raw --fat32  --align

PartAssist.exe /hd:4 /del:all

### 初始化

PartAssist.exe /init:4

PartAssist.exe /rebuildmbr:4  /mbrtype:2

### 创建EFI分区，激活，写引导

PartAssist.exe /hd:4 /cre /size:1024 /pri  /end  /act  /hide  /align  /fs:fat32 /label:EFI

BOOTICE.exe /DEVICE=4 /mbr /type=usbhdd+ /install /quiet

BOOTICE.exe /DEVICE=4:0 /pbr /type=bootmgr /install /quiet

### 写EFI分区文件

PartAssist.exe /hd:4 /whide:0 /src:C:\Users\yyds_\Desktop\230430

### 创建数据分区，EXFAT

PartAssist.exe /hd:4 /cre /size:auto /pri  /align  /fs:NTFS  /letter:H:

echo y|format H: /Q /FS:EXFAT /X

把个人数据分区格式化为exFAT格式：
PECMD.EXE DFMT H:,exFAT,mydata

### 强制设置分区ID
PECMD.EXE PART -admin 4#1 0x7
PECMD.EXE PART -admin 4#2 0xEF

### 解除占用(数据分区强制分配盘符)
PartAssist.exe /hd:4 /setletter:0 /letter:*
PartAssist.exe /hd:4 /setletter:0 /letter:auto