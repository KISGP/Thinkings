```embed
title: "RefineNet: Multi-Path Refinement Networks for High-Resolution Semantic Segmentation"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "Recently, very deep convolutional neural networks (CNNs) have shown outstanding performance in object recognition and have also been the first choice for dense classification problems such as semantic segmentation. However, repeated subsampling operations like pooling or convolution striding in deep CNNs lead to a significant decrease in the initial image resolution. Here, we present RefineNet, a generic multi-path refinement network that explicitly exploits all the information available along the down-sampling process to enable high-resolution prediction using long-range residual connections. In this way, the deeper layers that capture high-level semantic features can be directly refined using fine-grained features from earlier convolutions. The individual components of RefineNet employ residual connections following the identity mapping mindset, which allows for effective end-to-end training. Further, we introduce chained residual pooling, which captures rich background context in an efficient manner. We carry out comprehensive experiments and set new state-of-the-art results on seven public datasets. In particular, we achieve an intersection-over-union score of 83.4 on the challenging PASCAL VOC 2012 dataset, which is the best reported result to date."
url: "https://arxiv.org/abs/1611.06612"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "58.333333333333336"
```


# Introduction

## 1

> Second, dilated convolutions introduce a coarse sub-sampling of features, which potentially leads to a loss of important details.

使用空洞卷积来扩大感受野，从而避免了对特征图进行下采样，理论上能更好地保留细节。但在整个网络中处理高分辨率特征图会导致计算量和GPU显存需求激增。此外其“跳跃式”的采样方式可能忽略掉一些关键的局部细节。

空洞卷积信息丢失的根本原因在于其“跳跃式”的采样方式**破坏了图像信号的『局部结构完整性』**。这个行为导致了局部信号的**不连续采样**，从而无法捕捉到变化频率过快的精细细节。

此外信息丢失的本质，**无关乎参与计算的像素绝对数量的多少，而在于它彻底破坏了像素之间紧密的局部邻里关系**。

空洞卷积能够获得巨大感受野，这是它的优势。但它是**以“跳过”像素为代价**换来的。空洞卷积在采样时，在前一层特征图上制造了大量的“盲点”。如果一个重要的精细特征（比如一条细线、一个锐角）恰好落在了这些“盲点”上，那么无论最终感受野有多大，这个信息都已经**永久丢失**了。

空洞卷积并非“劣质”技术，而是一种明确的**权衡**。它**牺牲了“信息密度”和“局部结构完整性”，以高效地换取了“感受野大小”**。

在现代神经网络设计中，通常采用**混合空洞卷积**（交替使用不同的扩张率，来填补“盲点”）或**多尺度特征融合**（如ASPP模块）等策略，力求在享受大感受野的同时，弥补因稀疏采样而丢失的结构信息。


# Proposed Method
## 1

> Note that all convolutional components of the RefineNet have been carefully constructed inspired by the idea behind residual connections and follow the rule of identity mapping [25]. This enables effective backward propagation of the gradient through RefineNet and facilitates end-to-end learning of cascaded multi-path refinement networks.
> 
> Employing residual connections with **identity mappings** allows the gradient to be directly propagated from one block to any other blocks, as was recently shown by [25]. **This concept encourages to maintain a clean information path for shortcut connections, so that these connections are not “blocked” by any non-linear layers or components.** Instead, non-linear operations are placed on branches of the main information path. We follow this guideline for developing the individual components in RefineNet, including all convolution units. **It is this particular strategy that allows the multi-cascaded RefineNet to be trained effectively.** 

总结：RefineNet 的所有卷积模块都按 **残差/identity mapping（恒等映射）** 的设计原则来构造，让梯度可以“直接”穿过网络的层级（不被非线性阻断），从而能把多条分辨率路径级联起来端到端高效训练。唯一例外是在 chained residual pooling 里放了一个 ReLU，作者发现这对池化后的信息和学习率稳定性是有好处的，而且不会破坏梯度回传的效果。

残差连接的基本形式是

$$
y = x + F(x)
$$

这里 $x$ 是输入，$F(x)$ 是分支上的若干非线性变换（卷积、BN、ReLU 等）。对损失 $L$ 求关于 $x$ 的梯度：

$$
\frac{\partial L}{\partial x} = \frac{\partial L}{\partial y}\left(I + \frac{\partial F}{\partial x}\right)
$$

关键点：恒等项 $I$ 保证了从上游 $\frac{\partial L}{\partial y}$ ​ 有一份**直接、不经过任何可能“塌陷”操作**的梯度回流到 $x$。就算 $\frac{\partial L}{\partial y}$ ​ 很小（或消失），那份恒等梯度仍然存在，不会像纯串联深层那样被连乘导致“消失梯度”。

作者强调不要让 shortcut（捷径）被任何非线性层“阻塞”。如果 shortcut 上也放 ReLU、BN 或卷积（即 shortcut 不是纯恒等），那么恒等项 $I$ 会被替换为某个 $S'(\cdot)$，梯度会包含 $S'(\cdot)$ 的因子，可能是很小甚至为 0（比如 ReLU 在负区间导数为 0），这样就失去恒等传递的稳定性。

RefineNet 把来自不同分辨率的特征通过多条路径级联精细化（refinement）。级联越深、路径越多，梯度要跨越的层就越多——如果没有 identity shortcut，训练会很困难。恒等残差连接保证在级联的任意两点间都存在一条低阻抗（low-resistance）的梯度通路，从而可以端到端地训练这些深度/多路网络。

## 2

> Note that **we include one non-linear activation layer (ReLU) in the chained residual pooling block**. We observed that this ReLU is important for the effectiveness of subsequent pooling operations and it also makes the model less sensitive to changes in the learning rate. We observed that one single ReLU in each RefineNet block does not noticeably reduce the effectiveness of gradient flow.

为什么插一个 ReLU，但又不破坏梯度？

考虑一个残差块（恒等 shortcut 在外，分支内有一组操作，包含一个 ReLU）：

$$
y = x + F_{\text{branch}}(x)
$$

令

$$
F_{\text{branch}} = G(\sigma(H(x)))
$$

其中 $\sigma$ 是 ReLU。无论 $\sigma$ 的导数在某些位置为 0 与否，梯度到 $x$ 有恒等项：

$$
\frac{\partial L}{\partial x} = \frac{\partial L}{\partial y} + \frac{\partial L}{\partial y}\frac{\partial F_{\text{branch}}}{\partial x}
$$

第一个项 $\frac{\partial L}{\partial y}$ ​ 不依赖于 $\partial F_{\text{branch}}/\partial x$，所以即便分支在某些输入上“死掉”，第一项仍把梯度安全地传回去。只要网络里大部分 block 保留这种恒等路径，整体训练不会因为若干 ReLU 导数为 0 而崩塌。