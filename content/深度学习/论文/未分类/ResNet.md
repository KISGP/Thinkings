

```embed
title: "Deep Residual Learning for Image Recognition"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset we evaluate residual nets with a depth of up to 152 layers---8x deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won the 1st place on the ILSVRC 2015 classification task. We also present analysis on CIFAR-10 with 100 and 1000 layers.   The depth of representations is of central importance for many visual recognition tasks. Solely due to our extremely deep representations, we obtain a 28% relative improvement on the COCO object detection dataset. Deep residual nets are foundations of our submissions to ILSVRC & COCO 2015 competitions, where we also won the 1st places on the tasks of ImageNet detection, ImageNet localization, COCO detection, and COCO segmentation."
url: "https://arxiv.org/abs/1512.03385"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "0"
```

# Introduction

## 1

> Instead of hoping each few stacked layers directly fit a desired underlying mapping, we explicitly let these layers fit a residual mapping.

**普通思路**：假设某个理想函数是 $H(x)$，那就让一堆卷积层直接去拟合 $H(x)$。

**残差思路**：不直接拟合 $H(x)$，而是拟合 **残差**：$F(x) := H(x) - x$。

这样，网络的输出就是：$H (x) = F (x) + x$

> We hypothesize that it is easier to optimize the residual mapping than to optimize the original, unreferenced mapping. To the extreme, if an identity mapping were optimal, it would be easier to push the residual to zero than to fit an identity mapping by a stack of nonlinear layers.

原来要学 $H(x)$，这是“凭空”学一个复杂函数。现在只要学 $F (x) = H (x) - x$，即输入和输出的“差值”。很多时候，输入和目标之间的差异比目标函数本身简单得多也更容易学习。

如果最优函数就是恒等映射 $H(x)=x$，那么：$F (x) = H (x) - x = 0$，对网络来说，让残差分支学成全 0 要比“让一堆非线性卷积层学出恒等函数”简单得多。  因此，残差学习框架大大降低了优化难度。


> [!note] 直接拟合 vs 残差拟合
>
> 假设我们希望一个神经网络学到这个简单的线性映射：目标函数 $H(x)=2x$
>
> 1. **直接拟合 $H(x)$**
>
> 	传统思路：让网络直接输出 $2x$。
>
> 	输入 $X$，网络必须学到一个映射 $\hat{H}(x) \approx 2x$。对于一个初始化随机的小卷积网络来说，这个目标就是“直接把输入放大两倍”。看起来很简单，但对深层堆叠的非线性层来说，想要精确学到一个线性的 $2x$，并不一定容易，尤其是如果初始化不巧，梯度可能在传递时变小或变大，训练变慢。
>
> 2. **残差拟合 $F(x) = H(x) - x$**
>
>    残差思路：不让网络直接学 $2x$，而是学差值。$F(x)=H(x)−x=2x−x=x$ 于是：$H(x)=F(x)+x=x+x=2x$
>    
>    网络残差分支只需要学会“输出一个和输入一样的值”。最终通过残差连接 $x + F(x)$，得到目标 $2x$。
>
> ----
>
> 如果目标是恒等函数 $H(x) = x$
>
> - 直接拟合：网络要学到 $\hat{H}(x) = x$，这对深度堆叠来说很难。
> - 残差拟合：$F(x)=H(x)−x=x−x=0$。网络只要学一个“全零函数”就行，这在训练时非常容易收敛。



