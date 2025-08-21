# 安装 ubuntu

```powershell
wsl --install
```

> 默认情况下，安装的是Ubuntu
>
> 如果需要安装其他版本，查看 [教程](https://learn.microsoft.com/zh-cn/windows/wsl/install#change-the-default-linux-distribution-installed)

# 安装 Anaconda

## 1. 获取下载链接

在 [Anaconda](https://www.anaconda.com/) 官网找到下载链接

例如：https://repo.anaconda.com/archive/Anaconda3-2025.06-0-Linux-x86_64.sh

![image-20250710174838522](assets/image-20250710174838522.png)

## 2. 下载文件

切换文件夹

```sh
cd /tmp
```

下载 Anaconda

```sh
sudo wget https://repo.anaconda.com/archive/Anaconda3-2025.06-0-Linux-x86_64.sh
```

![image-20250710175046649](assets/image-20250710175046649.png)

## 3. 安装 Anaconda

通过bash命令安装 Anaconda

```sh
bash Anaconda3-2025.06-0-Linux-x86_64.sh
```

![image-20250710175652821](assets/image-20250710175652821.png)

接下来会让你决定是否要在每次启动终端时自动激活 Anaconda 的 `base` 环境。

![image-20250710175816508](assets/image-20250710175816508.png)

- **[yes]**：会将 conda 的 base 环境设置为启动时自动激活。这意味着每次打开终端时，conda 会自动激活 base 环境，并将其显示在命令提示符中。
- **[no]**：不设置自动激活。如果选择此项，每次你启动终端时，conda 不会自动激活 base 环境。

## 4. 添加 conda 命令

直接运行 conda 会提示无法找到 conda 命令

![image-20250710193958328](assets/image-20250710193958328.png)

在 anaconda 安装文件夹下的 bin 目录下，运行

```sh
~/anaconda3/bin/conda init
```

![image-20250710194202179](assets/image-20250710194202179.png)

重新加载 `.bashrc` 文件

```sh
source ~/.bashrc
```

![image-20250710194616238](assets/image-20250710194616238.png)

此时会进入 Anaconda 的默认环境，输入以下命令即可退出环境

```sh
conda deactivate
```

> [!note]
>
> 执行完 `conda init` 后 window terminal 在每次启动终端时会自动进入 `base` 环境，运行以下命令可以关闭这个功能
>
> ```sh
> conda config --set auto_activate_base false
> ```
>
> ![image-20250710195508293](assets/image-20250710195508293.png)

> [!tip]
>
> 没有必要手动在 `.bashrc` 末尾添加 `export PATH=~/anaconda3/bin:$PATH`，执行完 `conda init` 后会自动添加。
>
> ![image-20250710194834724](assets/image-20250710194834724.png)



## 5. conda 常用命令

### conda list

```sh
conda list
```

`conda list` 是一个用来 **列出当前激活的 conda 环境** 中已安装的所有包及其版本的命令。

![image-20250710200052258](assets/image-20250710200052258.png)

### conda create

在 Anaconda 中，**创建一个新的环境**可以使用 `conda` 命令来创建一个隔离的环境，并为该环境指定所需的 Python 版本和所需的包。

```sh
conda create --name <env_name> <package(s)>
```

假设我要创建一个名为 `myenv` 的环境，并安装 Python 3.8，只需要执行 `conda create --name myenv python=3.8`

![image-20250710201030306](assets/image-20250710201030306.png)

### conda env list

`conda env list` 是用来 **列出所有已创建的 conda 环境** 的命令。它会显示出当前系统中所有的 conda 环境以及它们的路径，并且标明哪个环境是当前激活的。

![image-20250710201230771](assets/image-20250710201230771.png)

> conda 在安装时会自动创建一个 **`base`** 环境

### conda activate

`conda activate` 是 conda 用来激活指定环境的命令。用于切换到一个已经创建的 **conda 环境**，在该环境中运行命令和管理包。

```
conda activate <env_name>
```

### conda deactivate

完成工作想退出当前环境时，可以运行：

```sh
conda deactivate
```

### conda remove

```sh
conda remove -n <env_name> --all
```

# 安装 Pytorch

## 1. 获取 CUDA 版本

```sh
nvidia-smi
```

![image-20250710204457146](assets/image-20250710204457146.png)

PyTorch 版本和 CUDA 版本的关系可以在[官网](https://pytorch.org/get-started/previous-versions/)中查看

![image-20250710204643890](assets/image-20250710204643890.png)

# 安装 CUDA Toolkit

## 1. 下载

在 [CUDA Toolkit 官网](https://developer.nvidia.com/cuda-downloads?target_os=Linux&target_arch=x86_64&Distribution=WSL-Ubuntu&target_version=2.0&target_type=runfile_local) 下载对应 CUDA 版本的工具箱

![image-20250710211547251](assets/image-20250710211547251.png)

## 2. 安装

运行官网给出的命令安装就行

安装完成

![image-20250710213726353](assets/image-20250710213726353.png)

## 3. 添加 nvcc 命令

在 `.bashrc` 末尾添加下面代码

```bash
export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/local/cuda-12.6/lib64
export PATH=$PATH:/usr/local/cuda-12.6/bin
export CUDA_HOME=$CUDA_HOME:/usr/local/cuda-12.6
export PATH=/usr/local/cuda/bin:$PATH
```

![image-20250710214230826](assets/image-20250710214230826.png)

# 资料

- [在 WSL 中开发](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-vscode)
- [如何使用 WSL 在 Windows 上安装 Linux](https://learn.microsoft.com/zh-cn/windows/wsl/install)
- [开始将 Visual Studio Code 与适用于 Linux 的 Windows 子系统配合使用](https://learn.microsoft.com/zh-cn/windows/wsl/tutorials/wsl-vscode)
- [在 WSL 上启用 NVIDIA CUDA](https://learn.microsoft.com/zh-cn/windows/ai/directml/gpu-cuda-in-wsl)
- [WSL 上的 CUDA 用户指南](https://docs.nvidia.com/cuda/wsl-user-guide/index.html#)
- [【WSL】WSL2-Ubuntu安装CUDA](https://blog.hz2016.com/2022/04/%E3%80%90wsl%E3%80%91wsl2-ubuntu%E5%AE%89%E8%A3%85cuda/)
- [WSL2安装CUDA，nvidia环境小白教程和踩坑记录](https://zhuanlan.zhihu.com/p/1880786925419472672)