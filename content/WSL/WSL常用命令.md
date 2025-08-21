# 关机

```sh
 wsl --shutdown
```

> 如果需要重新启动，可以直接在 window Terminal 中打开新标签页或者直接运行 wsl 命令

# 查看状态

```sh
wsl -l -v
```

![image-20250710180632680](assets/image-20250710180632680.png)

# 获取的 IP 地址

在 Windows 中获取 WSL2 的 IP 地址可以使用以下命令

```bash
wsl hostname -I
```

如果要获取 WSL2 中 Windows 主机的 IP 地址，可以在 WSL2 的终端中使用以下命令

```bash
ip route show | grep -i default | awk '{ print $3}'
```
