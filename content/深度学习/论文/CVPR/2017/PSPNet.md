
```embed
title: "Pyramid Scene Parsing Network"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "Scene parsing is challenging for unrestricted open vocabulary and diverse scenes. In this paper, we exploit the capability of global context information by different-region-based context aggregation through our pyramid pooling module together with the proposed pyramid scene parsing network (PSPNet). Our global prior representation is effective to produce good quality results on the scene parsing task, while PSPNet provides a superior framework for pixel-level prediction tasks. The proposed approach achieves state-of-the-art performance on various datasets. It came first in ImageNet scene parsing challenge 2016, PASCAL VOC 2012 benchmark and Cityscapes benchmark. A single PSPNet yields new record of mIoU accuracy 85.4% on PASCAL VOC 2012 and accuracy 80.2% on Cityscapes."
url: "https://arxiv.org/abs/1612.01105v2"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "58.333333333333336"
```


# Introduction

## 1

> he deep convolutional neural network (CNN) based methods boost **dynamic object understanding**, and yet still face challenges considering **diverse scenes** and **unrestricted vocabulary**.

dynamic object understanding 指的是 **CNN 在语义分割 / 检测中对典型、相对“活跃”的物体类别的识别能力**
（比如：人、车、动物、自行车）。这些物体大多数是**COCO、VOC 等主流数据集**里的常见类别，而且视觉特征比较明显（轮廓清晰、形状稳定）。

换句话说：**卷积网络对常见可移动物体的分割、识别已经很成熟**。

---

diverse scenes 指的是场景结构和内容的高度多样化，既包含室内外环境差异，又包含物体数量、尺度、布局的巨大变化。

---

unrestricted vocabulary 指的是在**场景解析（scene parsing）任务**中，类别集合非常庞大，几乎不设限。

ADE20K 数据集就是典型：它包含 **150+ 类别**，而且类别覆盖范围极广：动态对象（人、动物、车…）、静态物体（桌子、椅子、窗户…）、背景元素（天空、海、草地…）、建筑部分（墙、门、天花板…）。这种“开放式”类别体系，远比 VOC（20 类）、COCO（80 类）要复杂。

“unrestricted vocabulary” 就是强调：**类别规模巨大，几乎无限扩展，不像传统检测/分割数据集那样受限于几十个常见类**。


# Related Work

## 1

> To make good use of global image-level priors for diverse scene understanding, methods of [18, 27] extracted global context information with traditional features not from deep neural networks.

在 **PSPNet 提出之前**，很多尝试去利用“全局图像级的先验信息”来提升复杂场景理解。但早期的方法都是基于**传统手工特征**去建模全局上下文，而不是像现在这样直接用深度神经网络学到的特征。

**“传统手工特征”**，指的是在深度学习普及之前，人们通过人工设计的方法提取的图像特征，用来描述图像的纹理、形状、颜色、空间结构等信息。

这些特征的特点：

- **人为设计**（比如用梯度方向直方图来表达形状），不是通过大规模数据自动学习的。
- **表达能力有限**：能抓到一些局部或整体统计规律，但很难像深度 CNN 那样学到高层语义（例如“这是一张城市街景，包含汽车和行人”）

# Pyramid Scene Parsing Network
## 1

> Overlooking the global scene category may fail to parse the pillow.

这句话是在举例说明：**如果模型忽略了全局场景类别的上下文，就可能在语义分割时把某些局部目标解析错。**

“global scene category” 指的是整张图像的大场景语义，比如：卧室、客厅、街道、公园……这种“场景类别”是**图像级的先验信息**，能给模型提供上下文限制。

举个例子：

- 如果整张图像的场景类别是“卧室”，那么像素块里一个软垫状的东西，更可能是**枕头**，而不是石头或椅子靠垫。
    
- 如果整张图像的场景类别是“户外公园”，同样形状的区域就几乎不可能是“枕头”。

换句话说：**缺少全局场景信息 → 模型只能依赖局部纹理和形状 → 很可能把 pillow 分错**。**利用全局先验 → pillow 的可能性就被大大提高**。

## 2

> Although **theoretically the receptive field** of ResNet [13] is already larger than the input image, it is shown by Zhou et al. [42] that the **empirical receptive field** of CNN is much smaller than the theoretical one especially on high-level layers.

理论感受野：根据卷积核大小、步幅、层数，可以精确计算某一层神经元在输入图像上覆盖的区域大小。例如在 ResNet-50 的顶层，理论感受野可能已经大于输入图像的尺寸。

经验/有效感受野：Zhou 等人通过可视化发现，高层神经元并没有均匀利用整个理论感受野。对输出贡献最大的往往是靠近中心的一小块区域，越远离中心，影响迅速减弱。换句话说：理论感受野大 → 能覆盖全图，经验感受野小 → 实际只用到局部区域