
```embed
title: "U-Net: Convolutional Networks for Biomedical Image Segmentation"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "There is large consent that successful training of deep networks requires many thousand annotated training samples. In this paper, we present a network and training strategy that relies on the strong use of data augmentation to use the available annotated samples more efficiently. The architecture consists of a contracting path to capture context and a symmetric expanding path that enables precise localization. We show that such a network can be trained end-to-end from very few images and outperforms the prior best method (a sliding-window convolutional network) on the ISBI challenge for segmentation of neuronal structures in electron microscopic stacks. Using the same network trained on transmitted light microscopy images (phase contrast and DIC) we won the ISBI cell tracking challenge 2015 in these categories by a large margin. Moreover, the network is fast. Segmentation of a 512x512 image takes less than a second on a recent GPU. The full implementation (based on Caffe) and the trained networks are available at http://lmb.informatik.uni-freiburg.de/people/ronneber/u-net ."
url: "https://arxiv.org/abs/1505.04597"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "0"
```

![](assets/20250808134653.png)

# Introduction
## 1

> One important modification in our architecture is that in the upsampling part we have also a large number of feature channels, which allow the network to propagate context information to higher resolution layers. As a consequence, the expansive path is more or less symmetric to the contracting path, and yields a u-shaped architecture.

**收缩路径（左半边U）**：和普通网络一样，通过卷积和下采样，不断压缩图像，提取高级的、抽象的**上下文信息**（Context Information）。

**扩张路径（右半边U）**：这是U-Net的创新所在。在通过上采样恢复图像分辨率时，它**并不是一个简单的、轻量级的解码器**。相反，它的结构非常“重”，拥有**大量的特征通道**。


> The network does **not have any fully connected layers** and only uses **the valid part of each convolution**, i.e., the segmentation map only contains the pixels, for which the full context is available in the input image.

无全连接层保证了网络能处理任意尺寸的输入。

“有效”卷积说明 U-Net 在卷积时**不使用填充**。带填充可以使卷积后图像尺寸不变，而不带填充会让卷积后图像尺寸缩小。作者认为这样可以保证输出的每一个像素都是在“看到”了完整的上下文信息（比如完整的3x3邻域）后计算出来的，避免了边界填充可能带来的伪影。但代价是，输出的分割图会比输入的图像块小一圈。


> This strategy allows the seamless segmentation of arbitrarily large images by an **overlap-tile strategy**... To predict the pixels in the border region of the image, the missing context is extrapolated by mirroring the input image.

医学图像通常非常大（比如 `2048x2048`），一次性塞进GPU内存里是不可能的。U-Net的解决方案是：**把它切成小块处理，再无缝拼接起来**。
想象一下你在擦一块非常大的玻璃窗，但你的抹布（GPU能处理的图像块）很小。

1. **切片 (Tile)**：你先把玻璃窗划分为很多个小区域（比如`512x512`）。
   
2. **问题**：如果你一块一块地擦，擦完的区域之间会有难看的“接缝”。特别是每一块的边缘，因为信息不足，擦得（预测得）肯定不准。甚至“有效”卷积还会让输出变小，边缘信息直接就丢失了。
   
3. **重叠 (Overlap)**
   
    - 你先擦第一块区域（蓝色部分）。因为输出会变小，你只得到中心区域（黄色部分）的准确结果。
      
    - 然后，你移动抹布，**让它和上一块区域有很大一部分是重叠的**。你再次处理，同样只取其中心有效的预测结果。
      
    - 通过这种方式，上一块区域的“边缘地带”，在下一次处理时就变成了“中心地带”，从而得到了准确的预测。最终，所有区域的中心有效部分拼接起来，就成了一张**完整的、无缝的**分割图。

![](assets/20250807134016.png)
> To predict the pixels in the border region of the image, the missing context is extrapolated by mirroring the input image.

当输入块已经位于最边缘时，它的一部分“上下文”是在图像之外的，是缺失的。

对于整张大图最外圈的边界，U-Net的策略是**镜像填充**。它会把图像边界的内容像照镜子一样反射出去，填补缺失的上下文区域。这比用0来填充要自然得多，能让网络更好地预测最外圈的像素。

# Training

## 1

> To minimize the overhead and make maximum use of the GPU memory, **we favor large input tiles over a large batch size and hence reduce the batch to a single image**. **Accordingly we use a high momentum (0.99)** such that a large number of the previously seen training samples determine the update in the current optimization step.

- 大批量 (Large batch size): 一次处理很多张**小尺寸**的图片。
- 大尺寸输入 (Large input tiles): 一次只处理一张**大尺寸**的图片。

U-Net处理的是高分辨率医学影像，需要看清细节，所以作者选择后者。他们把“批量大小”减小到极限，即**每次只用一张图片**来更新模型。

每次只根据一张图片来调整方向（更新模型参数），这个方向可能会非常“抖动”和“不稳定”。比如，这一张图片让你觉得应该往东走，下一张又让你觉得应该往西。作者的解决方案是使用高动量 (High Momentum)，“动量”就像给一个正在滚动的球增加了惯性。

想象一个很重的铁球在下山。你每次只能推它一下（用一张图片来更新）。如果动量很小（球很轻），你一推它就改变方向。如果动量很大（球很重，惯性大），你推一下几乎改变不了它的滚动方向。它的方向是由**过去很多次推力累积决定的**。0.99是一个非常高的动量值，意味着当前的前进方向99%取决于之前的方向，只有1%由当前这张图片决定。这能有效抵消单张图片带来的噪声，让训练过程更稳定。

## 2 

在U-Net的最后一层，网络会为每一个像素在每一个类别上生成一个原始的分数（logit），Softmax函数的作用就是将这些分数转换成有意义的概率。

$$
p_k(\mathbf{x}) = \frac{\exp(a_k(\mathbf{x}))}{\sum_{k'=1}^{K} \exp(a_{k'}(\mathbf{x}))}
$$

- $x$: 图像中的一个像素点。
- $k$: 某个特定的类别，例如“细胞”或“背景”。
- $K$: 总的类别数量。
- $a_k​(x)$: 网络为像素 $x$ 在类别 $k$ 上输出的原始激活分数（logit）。
- $exp(⋅)$: 自然指数函数。它能将任何实数分数映射到正数，并放大分数之间的差距。
- $p_k​(x)$: 经过 Softmax 计算后，像素 $x$ 属于类别 $k$ 的最终概率。

Softmax 函数的目标是生成一个概率分布。它具有两个特性：

1. **归一化**: 确保对于同一个像素 $x$，其属于所有类别的概率之和为 1。
2. **放大优势**: 指数函数会不成比例地放大那些原始分数较高的类别。这使得分数最高的类别的最终概率会非常接近1，而其他类别的概率则被压缩到接近0，实现一种“赢家通吃”的效果。

> [!NOTE] 案例
> 假设对于某个像素，网络输出2个类别的分数：背景 $a_1=2.0$，细胞 $a_2=5.0$。
>
> 1. 计算指数：$e^{2.0}≈7.4$，$e^{5.0}≈148.4$。
> 2. 计算分母（总和）：$7.4+148.4=155.8$。
> 3. 计算最终概率：
>    - $p_\text{背景}(x)=155.87.4≈4.7\%$
>    - $p_\text{细胞}(x)=155.8148.4≈95.3\%$
>
> 可以看到，原始分数的差距（5.0 vs 2.0）被显著放大为了概率上的绝对优势（95.3% vs 4.7%）。

## 3 

在得到每个像素的预测概率后，我们需要一个函数来衡量这个预测与真实标签之间的差距。这个差距就是“损失”，训练的目标就是最小化这个损失。

$$
E = \sum_{\mathbf{x} \in \Omega} w(\mathbf{x}) \log(p_{\ell(\mathbf{x})}(\mathbf{x}))
$$

- $\Omega$: 图像中所有像素的集合。
- $\sum_{x\in \Omega}$​: 对图像中的每一个像素进行计算，然后将结果相加。
- $\ell(x)$: 像素 $x$ 的**真实类别标签**。
- $p_{\ell(x)}​(x)$: 网络预测像素 $x$ 属于其**真实类别**的概率。
- $w(x)$: 为像素 $x$ 指定的**权重**，用于调整该像素在总损失中的重要性。

此公式的目标是：**最大化模型对所有像素的正确预测的置信度**。

- 如果模型对一个像素的正确类别预测出了很高的概率（例如 $p_{\ell(x)}​(x)=0.99$），那么 $\log(0.99)$ 是一个接近0的负数，对总能量E的贡献很小（意味着惩罚小）。
- 如果模型预测错了，给正确类别分配了很低的概率（例如 $p_{\ell(x)}​(x)=0.01$），那么 $\log(0.01)$ 是一个绝对值很大的负数，对总能量E的贡献很大（意味着惩罚大）。

通过这个机制，损失函数会严厉惩罚那些偏离真实标签的预测，从而驱动模型参数向着正确的方向更新。

## 4 

权重图 (Weight Map)是 U-Net 论文的一大创新，用于解决类别不平衡和边界难以分割的问题。

$$
w(\mathbf{x}) = w_c(\mathbf{x}) + w_0 \cdot \exp\left(-\frac{(d_1(\mathbf{x}) + d_2(\mathbf{x}))^2}{2\sigma^2}\right)
$$
- $w_c​(x)$: **类别频率权重 (Class Frequency Weight)**。这是一个基础权重，用于平衡数据集中不同类别的像素数量。例如，如果“细胞”像素远少于“背景”像素，$w_c​$ 会给所有“细胞”像素一个较高的值，以提升它们在训练中的重要性。
- $d_1​(x)$: 像素 $x$ 到**最近的**细胞边界的距离。
- $d_2​(x)$: 像素 $x$ 到**第二近的**细胞边界的距离。
- $w_0​$, $\sigma$: 手动设置的超参数。$w_0​$ ​ 控制边界权重的强度（论文中设为10），$\sigma$ 控制权重影响的范围（论文中设为5个像素）。

该公式旨在生成一个权重图，其中**位于紧密接触的细胞之间的边界像素**被赋予极高的权重。

- **对于细胞内部的像素**：该像素离所有边界都较远，因此 $d_1​(x)$ 和 $d_2​(x)$ 的值都很大，导致指数项 $exp(−\text{一个很大的数})$ 的结果趋近于0。因此，其总权重 $w(x)≈w_c​(x)$。
- **对于位于两个细胞间隙的像素**：该像素离第一个细胞的边界非常近（$d_1$ ​极小），同时离第二个细胞的边界也非常近（$d_2$ ​极小）。这使得 $(d_1​(x)+d_2​(x))^2$ 的值非常小，指数项 $exp(−\text{一个很小的数})$ 的结果趋近于1。因此，其总权重 $w(x)≈w_c​(x)+w_0​$。这个像素点获得了值为10的巨大额外权重。