
```embed
title: "Fully Convolutional Networks for Semantic Segmentation"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "Convolutional networks are powerful visual models that yield hierarchies of features. We show that convolutional networks by themselves, trained end-to-end, pixels-to-pixels, exceed the state-of-the-art in semantic segmentation. Our key insight is to build \"fully convolutional\" networks that take input of arbitrary size and produce correspondingly-sized output with efficient inference and learning. We define and detail the space of fully convolutional networks, explain their application to spatially dense prediction tasks, and draw connections to prior models. We adapt contemporary classification networks (AlexNet, the VGG net, and GoogLeNet) into fully convolutional networks and transfer their learned representations by fine-tuning to the segmentation task. We then define a novel architecture that combines semantic information from a deep, coarse layer with appearance information from a shallow, fine layer to produce accurate and detailed segmentations. Our fully convolutional network achieves state-of-the-art segmentation of PASCAL VOC (20% relative improvement to 62.2% mean IU on 2012), NYUDv2, and SIFT Flow, while inference takes one third of a second for a typical image."
url: "https://arxiv.org/abs/1411.4038"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "0"
```

# 1

> Convnets are built on translation invariance. Their basic components (convolution, pooling, and activation functions) operate on local input regions, and depend only on relative spatial coordinates.

卷积神经网络是建立在**平移不变性**之上的。

通俗地讲：**对于一张图像，无论图像中的物体被平移到哪个位置，卷积神经网络都应该能认出它是什么。**

CNN主要通过两个关键组件来实现这一特性：卷积层和池化层。
- 与传统神经网络不同，CNN的卷积层使用一组卷积核。卷积核会滑过整张输入图像的所有区域，用同一套参数（共享的权重）去检查每一个位置。无论特征出现在图像的哪个位置，负责检测它的那个卷积核都能在对应位置被激活，从而在输出的“特征图”上标记出来。
- 虽然卷积层能到处找到特征，但特征图依然保留着精确的位置信息。如果后面直接接一个全连接层，模型还是会对位置非常敏感。这时，池化层就登场了。最常见的池化操作是最大池化。它会将特征图划分为若干个小区域，然后只保留每个区域中的最大值，丢弃其他信息。这个操作的关键在于它丢弃了特征的精确位置信息。它只关心某个区域内是否出现了某个强烈的特征，而不关心这个特征到底出现在区域里的哪个具体像素上。


# 2

> A real-valued loss function composed with an FCN defines a task. If the loss function is a sum over the spatial dimensions of the final layer, $\ell (x;\theta)={\textstyle \sum_{ij}^{}} \ell^{'} (x_{ij};\theta )$, its gradient will be a sum over the gradients of each of its spatial components. Thus stochastic gradient descent on $\ell$ computed on whole images will be the same as stochastic gradient descent on  $\ell^{'}$, taking all of the final layer receptive fields as a minibatch.

FCN一次性处理整张图，和传统方法把图切成很多小块（patch）分别处理，在训练效果上是一样的。或者说训练方式在数学上是等价的。

传统方法（滑窗切块）是从大照片的左上角切出一块小图（比如 32x32 像素）。把这块小图输入网络，得到一个分类结果，计算一次“损失”（loss）。然后把切块向右移动一点点，再切一块，再计算一次损失...最后，把整张大照片上成千上万个小图块的损失加起来，得到一个总损失，然后根据这个总损失来更新模型的参数（这就是梯度下降）。

FCN 的方法（整图输入）是直接把一整张大照片输入网络。网络一次性输出一张与原图大小相近的“损失地图”，图上每个点的值，就代表了原图对应位置的损失。把这张“损失地图”上所有点的损失值加起来，得到总损失。

FCN一次性处理整张图，本质上就相当于把图中每一个输出点所对应的输入区域（感受野）看作一个“微批次”（minibatch），然后并行地完成了所有计算。


> When these **receptive fields overlap significantly**, both feedforward computation and backpropagation are much more efficient when computed layer-by-layer over an entire image instead of independently patch-by-patch.

FCN避免了对图像重叠区域的重复计算，因此速度更快。

当你从大照片上切出一块 32x32 的小图，然后向右移动一个像素，再切一块 32x32 的小图。这两块小图有极大部分是重叠的。对于这些重叠的区域，传统方法会一遍又一遍地进行完全相同的卷积计算。而 FCN 直接处理整张大图，网络中的每一层卷积都只在整个图片上进行一次。所有重叠区域的计算自然而然地被共享了。

# 3

> Typical recognition nets, including LeNet [21], AlexNet[19], and its deeper successors [31, 32], ostensibly take fixed-sized inputs and produce nonspatial outputs. The fully connected layers of these nets have fixed dimensions and throw away spatial coordinates.

传统分类网络（如AlexNet）因为末端有“全连接层”，所以只能处理固定大小的图片，并且会丢失所有位置信息。

因为传统的图像分类网络的末端，有一个关键部件——**全连接层 (Fully Connected Layer)**。它的作用就像一台“搅拌机”。无论前面处理得多么精细，保留了水果块的形状和纹理（**空间信息**），只要一进入这个搅拌机，所有东西都会被搅成一杯果汁。你最终只知道这杯果汁的成分（比如，80%是苹果，20%是香蕉），但完全不知道原来水果块的形状和它们在盘子里的位置了。这就是“**丢弃了空间坐标**”和产生“**非空间输出**”。

> However, these fully connected layers can also be viewed as convolutions with kernels that cover their entire input regions. Doing so casts them into fully convolutional networks that take input of any size and output classification maps. 

