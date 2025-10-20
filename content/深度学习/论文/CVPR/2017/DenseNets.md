```embed
title: "Densely Connected Convolutional Networks"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "Recent work has shown that convolutional networks can be substantially deeper, more accurate, and efficient to train if they contain shorter connections between layers close to the input and those close to the output. In this paper, we embrace this observation and introduce the Dense Convolutional Network (DenseNet), which connects each layer to every other layer in a feed-forward fashion. Whereas traditional convolutional networks with L layers have L connections - one between each layer and its subsequent layer - our network has L(L+1)/2 direct connections. For each layer, the feature-maps of all preceding layers are used as inputs, and its own feature-maps are used as inputs into all subsequent layers. DenseNets have several compelling advantages: they alleviate the vanishing-gradient problem, strengthen feature propagation, encourage feature reuse, and substantially reduce the number of parameters. We evaluate our proposed architecture on four highly competitive object recognition benchmark tasks (CIFAR-10, CIFAR-100, SVHN, and ImageNet). DenseNets obtain significant improvements over the state-of-the-art on most of them, whilst requiring less computation to achieve high performance. Code and pre-trained models are available at https://github.com/liuzhuang13/DenseNet ."
url: "https://arxiv.org/abs/1608.06993"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "0"
```

![](assets/20250813134908.png)
# Introduction

## 1

> A possibly counter-intuitive effect of this dense connectivity pattern is that it requires fewer parameters than traditional convolutional networks, as there is no need to relearn redundant feature-maps.

传统的CNN（比如AlexNet, VGG）中，每一层都会从上一层接收输入，然后通过卷积操作生成一组新的特征图作为输出。在DenseNet看来，这个过程可能会导致重复学习。例如，一个低层的特征（比如边缘）可能在网络中多次被不同层“重新发现”和学习。

在DenseNet中，每一层都可以直接访问所有前面层的特征图。这就意味着，一个低层学到的特征，可以被高层直接使用，而不需要高层再去重新学习类似的特征。因此，每一层只需要学习一小部分新的、独特的特征（也就是作者后面提到的“narrow”），而不需要像传统网络那样，每一层都学习大量特征图，从而大大减少了参数量。

## 2

> Our proposed DenseNet architecture explicitly differentiates between information that is added to the network and information that is preserved. DenseNet layers are very narrow (e.g., 12 filters per layer), adding only a small set of feature-maps to the “collective knowledge” of the network and keep the remaining feature-maps unchanged—and the final classifier makes a decision based on all feature-maps in the network.

DenseNet没有像ResNet那样通过加法来合并信息。它直接将前面所有层的特征图“串联”起来，作为当前层的输入。通过这种拼接的方式，所有前面层的特征图都被原封不动地保留了下来，传递给了当前层。

当前层只负责生成一小部分新的特征图（“非常窄”，例如只有12个过滤器）。这些新生成的特征图被添加到“集体知识”中，供后面的层使用。“集体知识”指的是网络中所有层已经学习到的所有特征图的集合。每一层都向这个集体知识中贡献一点新的、独特的知识，但同时又保留了已有的所有知识。

最终的分类器，不是只看最后一层的输出，而是基于网络中所有层生成的、拼接在一起的所有特征图来做出决策。这使得分类器能够利用到所有层次的特征，从简单的边缘到复杂的对象部分，都能够被有效利用。

# Related Work

## 1

>This constitutes a major difference between DenseNets and ResNets.Compared to Inception networks [36, 37], which also concatenate features from different layers, DenseNets are simpler and more efficient.

ResNet 使用**加法**来合并信息：$y = F(x) + x$。而 DenseNet 使用**拼接**：$y = F([x_0, x_1, ..., x_{l-1}])$。加法操作将两个特征图的信息“融合”在一起，可能会丢失一些信息。拼接操作则将所有特征图都保留了下来，信息得到了最大程度的保留和重用。

Inception 网络在每一个 Inception 模块内，也会将不同卷积核（例如 1x1, 3x3, 5x5）的输出拼接在一起。这和 DenseNet 的拼接有相似之处。然而，DenseNet 的拼接是在**不同层之间**进行的，结构更统一、更简单。Inception 模块内部的结构非常复杂，包含多个并行的卷积分支。

# DenseNets

## 1

>Although each layer only produces $k$ output feature-maps, it typically has many more inputs.

这是引入瓶颈层的根本原因。在 DenseNet 中，每一层的输入是前面所有层的特征图的拼接。随着网络层数 $l$ 的增加，输入特征图的数量呈线性增长，即 $k_0​+k\times (l−1)$。即使增长率 $k$ 很小，当网络很深时，输入通道数也会变得非常大。这会导致后续的卷积操作计算量剧增。

> It has been noted in [37, 11] that a 1×1 convolution can be introduced as bottleneck layer before each 3×3 convolution to reduce the number of input feature-maps, and thus to improve computational efficiency. 

**1×1 卷积**的作用就是**降维**。它可以在不改变特征图空间尺寸（高和宽）的情况下，将输入的通道数大大减少。通过 3×3 卷积之前先进行降维，可以显著降低计算量，提高效率。





# 参考材料

```embed
title: "Dense Convolutional Network and Its Application in Medical Image Analysis - PMC         "
image: "https://cdn.ncbi.nlm.nih.gov/pmc/banners/logo-bmri.png"
description: "Dense convolutional network (DenseNet) is a hot topic in deep learning research in recent years, which has good applications in medical image analysis. In this paper, DenseNet is summarized from the following aspects. First, the basic principle of ..."
url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9060995"
favicon: "https://pmc.ncbi.nlm.nih.gov/static/img/favicons/favicon-48x48.png"
aspectRatio: "0"
```
