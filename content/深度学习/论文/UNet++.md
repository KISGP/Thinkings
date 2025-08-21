```embed
title: "UNet++: A Nested U-Net Architecture for Medical Image Segmentation"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "In this paper, we present UNet++, a new, more powerful architecture for medical image segmentation. Our architecture is essentially a deeply-supervised encoder-decoder network where the encoder and decoder sub-networks are connected through a series of nested, dense skip pathways. The re-designed skip pathways aim at reducing the semantic gap between the feature maps of the encoder and decoder sub-networks. We argue that the optimizer would deal with an easier learning task when the feature maps from the decoder and encoder networks are semantically similar. We have evaluated UNet++ in comparison with U-Net and wide U-Net architectures across multiple medical image segmentation tasks: nodule segmentation in the low-dose CT scans of chest, nuclei segmentation in the microscopy images, liver segmentation in abdominal CT scans, and polyp segmentation in colonoscopy videos. Our experiments demonstrate that UNet++ with deep supervision achieves an average IoU gain of 3.9 and 3.4 points over U-Net and wide U-Net, respectively."
url: "https://arxiv.org/abs/1807.10165"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "0"
```


# Introduction

## 1

> The underlying hypothesis behind our architecture is that the model can more effectively capture fine-grained details of the foreground objects when **high-resolution feature maps from the encoder network are ==gradually enriched==** prior to fusion with the corresponding **==semantically rich== feature maps from the decoder network**.

如果来自**编码器的高分辨率特征图**（包含细节），在与来自**解码器的语义丰富特征图**（包含高级概念）融合**之前**，能够被**逐步地丰富**，那么模型就能更有效地捕捉前景物体的精细细节。

这是 UNet++ 最核心的创新思想，关键词是 **“逐步丰富” (gradually enriched)**。

逐步丰富：在融合两种差别巨大的信息之前，先让它们“互相靠近”一点，融合过程就会更顺利，结果也会更好。

在标准的 U-Net 中，编码器的特征图被直接、粗暴地传送到解码器。在 UNet++ 中，这个过程不再是“一步直达”，而是变成了一个多步骤的“旅程”。编码器的特征图在到达解码器之前，会经过跳跃路径上的一系列中间卷积层。在每一步，它都会接收来自更深层网络的信息，从而让自身携带的纯粹的“细节信息”逐渐融入一些“语义信息”。

> [!note] 例
>
> 假设我们的目标是在 CT 扫描图像中精确圈出肿瘤的轮廓。
>
> - **编码器的浅层特征**: 图像的**边缘信息**。计算机检测到了很多线条和轮廓，包括肋骨的边缘、肺部的边缘，当然也包括肿瘤的边缘。但计算机本身不知道哪条线是肋骨，哪条线是肿瘤。
> - **解码器的深层特征**: 经过深度学习网络分析后得出的**高级概念**：“在左肺下叶区域有一个高密度团块，高度疑似肿瘤。” 这个信息有位置、有定性，但没有精确的边界。
>
> #### U-Net 的方式（直接融合）
>
> 
>
> 网络试图将“一大堆边缘线条”和“左肺下叶有肿瘤”这两个信息直接结合。网络会很“纠结”，在肿瘤附近的众多线条中，到底哪些才是真正属于肿瘤边界的？学习任务很困难。
>
> 
>
> #### UNet++ 的方式（逐步丰富）
>
> 
>
> 1. **原始边缘信息**被送到一个中间处理步骤。
> 2. 这个步骤会结合来自更深层网络的一点点信息（比如“我们现在关注的是肺部”），从而**过滤掉**一部分明显不相关的边缘（比如图像外的伪影边缘）。
> 3. 信息继续传递，再结合更深层的信息（比如“我们关注的是高密度区域”），从而**进一步过滤**掉正常组织的边缘（比如肋骨边缘）。
> 4. 最后，这份被**逐步“净化”和“丰富”**过的边缘信息，只剩下了最可能与“左肺下叶肿瘤”这个概念相关的轮廓。
> 5. 当这份“精选”过的边缘信息与最终的“肿瘤”概念融合时，网络就能非常自信且精确地勾勒出肿瘤的轮廓。

## 2

> We argue that the network would deal with an **easier learning task** when the feature maps from the decoder and encoder networks are **semantically similar**. This is in contrast to the plain skip connections commonly used in U-Net, which directly fast-forward high-resolution feature maps... resulting in the fusion of **semantically dissimilar feature maps**.

我们认为，当解码器和编码器的特征图在**语义上更相似**时，网络的学习任务会**变得更简单**。这与 U-Net 中常用的普通跳跃连接形成了鲜明对比。U-Net 的连接方式是直接“快进”高分辨率特征图，导致了**语义上完全不同** 的特征图被强制融合在一起。

**语义鸿沟 (Semantic Gap)** 是理解 UNet++ 的关键。

在 U-Net 的跳跃连接中，网络需要融合两种截然不同的信息：

- 来自编码器的特征图:
  
    特点: 分辨率高，保留了大量的空间细节，比如物体的精确边缘、纹理、轮廓。
    
    语义层次: 非常低。它只知道“这里有一条线”，但不知道这条线是“建筑的轮廓”还是“肿瘤的边界”。它更接近于原始像素。
    
- 来自解码器的特征图:
  
    特点: 经过了多次卷积和下采样，分辨率很低，空间细节模糊。
    
    语义层次: 非常高。它已经“理解”了图像内容，知道“这块区域是一个人脸”或者“这个模糊的团块是病灶”。

U-Net 的做法是把这两者直接“拼接”在一起，然后让一个卷积层去学习如何融合它们。但这是个“困难的学习任务”，“困难”主要体现在**网络优化的过程**上。当网络试图融合两种语义上完全不搭边的特征时，会发生以下问题：

1. **信息冲突**: “像素级”信息和“概念级”信息在某种程度上是矛盾的。前者关注“细枝末节”，后者关注“整体大局”。网络在进行梯度下降优化时，可能会收到相互冲突的信号，导致学习过程不稳定。
2. **梯度优化困难**: 在 U-Net 中，融合语义差异巨大的特征导致这个“地形”非常崎岖，充满了局部最小值（陷阱）和陡峭的悬崖。优化器（如 SGD 或 Adam）很容易在寻找最优解的路上“迷路”，或者陷入一个“还不错但不是最好”的局部陷阱里。网络需要学习一个非常复杂、非常扭曲的函数才能把这两种信息捏合好。


UNet++ 的核心就是**在融合之前，先填补这个语义鸿沟**。它通过**嵌套和密集的跳跃连接**，对来自编码器的“像素级”信息进行了一系列**预处理和丰富**。在这个过程中，“像素级”信息不断地与来自更深层网络的“概念级”信息进行小规模、渐进式的融合。当这个特征最终抵达解码器准备进行大融合时，它已经不再是纯粹的“像素级”信息了，而是进化成了“带有概念指导的、高分辨率的细节信息”**。




# Proposed Network Architecture: UNet++

![](assets/20250808224050.png)
## 1
$$
x^{i, j}=\left\{\begin{array}{ll}
\mathcal{H}\left(x^{i-1, j}\right), & j=0 \\
\mathcal{H}\left(\left[\left[x^{i, k}\right]_{k=0}^{j-1}, \mathcal{U}\left(x^{i+1, j-1}\right)\right]\right), & j>0
\end{array}\right.
$$

其中

$$
\left[x^{i, k}\right]_{k=0}^{j-1} = \left[ x^{i,0}, x^{i,1}, \dots, x^{i,j-1} \right]
$$

- $x^{i,j}$: 代表最终计算出的、位于第 i 层深度（行）、第 j 个卷积阶段（列）的节点的特征图。
- $\mathcal{H}()$: 代表一个卷积块，通常包含：一个的卷积层和一个激活函数。
- $[...]$: 方括号代表一个拼接操作，它将括号内所有的特征图沿着“通道”维度堆叠起来，形成一个通道数更多、更“厚”的特征图。这是实现信息融合的基础。


## 2

> We have added a combination of **binary cross-entropy** and **dice coefficient** as the loss function to each of the above four semantic levels...

使用了由**二元交叉熵 (Binary Cross-Entropy, BCE)** 和 **Dice系数 (Dice Coefficient)** 组合而成的损失函数。

$$
Loss=Loss_{BCE}+Loss_{Dice}
$$

- 二元交叉熵 (BCE) 是图像分割中最常用、最基础的损失函数之一。

  它将分割问题看作是**逐个像素的二分类问题**。对于每一个像素，它都会判断“这是前景还是背景？”，并计算预测概率与真实标签之间的“距离”。优点是训练过程非常稳定。缺点是在处理**类别不平衡**问题时，BCE 可能会“偷懒”。因为背景像素占了99%，网络只要无脑地把所有像素都预测成背景，损失就已经很低了，导致它学不会去识别那1%的微小前景。

- Dice 系数损失基于一个衡量两个集合重合度的指标——Dice系数。它衡量的是预测区域和真实区域的重叠程度。

  它不关心单个像素是否正确，而是从**全局**角度看预测出来的**形状**和真实形状的重合度。优点是**对类别不平衡问题不敏感**。无论病灶多小，只要你没预测出来，重叠度就是0，Dice损失就很大。这会强迫网络去努力寻找那些稀有的前景目标。缺点是在训练早期，当网络预测的区域非常小时，可能会导致梯度不稳定。



