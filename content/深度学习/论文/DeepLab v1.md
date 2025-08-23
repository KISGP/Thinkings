```embed
title: "Semantic Image Segmentation with Deep Convolutional Nets and Fully Connected CRFs"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "Deep Convolutional Neural Networks (DCNNs) have recently shown state of the art performance in high level vision tasks, such as image classification and object detection. This work brings together methods from DCNNs and probabilistic graphical models for addressing the task of pixel-level classification (also called \"semantic image segmentation\"). We show that responses at the final layer of DCNNs are not sufficiently localized for accurate object segmentation. This is due to the very invariance properties that make DCNNs good for high level tasks. We overcome this poor localization property of deep networks by combining the responses at the final DCNN layer with a fully connected Conditional Random Field (CRF). Qualitatively, our \"DeepLab\" system is able to localize segment boundaries at a level of accuracy which is beyond previous methods. Quantitatively, our method sets the new state-of-art at the PASCAL VOC-2012 semantic image segmentation task, reaching 71.6% IOU accuracy in the test set. We show how these results can be obtained efficiently: Careful network re-purposing and a novel application of the 'hole' algorithm from the wavelet community allow dense computation of neural net responses at 8 frames per second on a modern GPU."
url: "https://arxiv.org/abs/1412.7062"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "0"
```

```embed
title: "Semantic Image Segmentation with Deep Convolutional Nets and Fully Connected CRFs"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "Deep Convolutional Neural Networks (DCNNs) have recently shown state of the art performance in high level vision tasks, such as image classification and object detection. This work brings together methods from DCNNs and probabilistic graphical models for addressing the task of pixel-level classification (also called \"semantic image segmentation\"). We show that responses at the final layer of DCNNs are not sufficiently localized for accurate object segmentation. This is due to the very invariance properties that make DCNNs good for high level tasks. We overcome this poor localization property of deep networks by combining the responses at the final DCNN layer with a fully connected Conditional Random Field (CRF). Qualitatively, our \"DeepLab\" system is able to localize segment boundaries at a level of accuracy which is beyond previous methods. Quantitatively, our method sets the new state-of-art at the PASCAL VOC-2012 semantic image segmentation task, reaching 71.6% IOU accuracy in the test set. We show how these results can be obtained efficiently: Careful network re-purposing and a novel application of the 'hole' algorithm from the wavelet community allow dense computation of neural net responses at 8 frames per second on a modern GPU."
url: "https://arxiv.org/abs/1412.7062"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "58.333333333333336"
```


# CONVOLUTIONAL NEURAL NETWORKS FOR DENSE IMAGE LABELING

## 1

>As a first step to implement this, we convert the fully-connected layers of VGG-16 into convolutional ones and run the network in a convolutional fashion on the image at its original resolution. However this is not enough as it yields **very sparsely** computed detection scores (**with a stride of 32 pixels**).

detection scores 是指**全卷积网络输出的像素级分类分数**。

“非常稀疏”的原因是，在将 VGG-16 等分类网络直接转换为全卷积网络时，由于**网络中大量的下采样操作**，导致最终的输出特征图分辨率极低，使得我们无法为原始图像的每一个像素都得到一个预测分数，而只能每隔一段距离得到一个，从而丢失了精细的边界信息。

这也是 DeepLabv1 引入空洞卷积的核心动机：**直接在网络内部控制分辨率，避免这种稀疏性**，从而实现密集的特征提取和更精确的像素级预测。

步长为32像素指的是，在最终的预测分数图上，每相邻的两个点，在原始图像上实际相隔了 32 个像素。这意味着，我们**每隔 32 个像素**才能得到一个分类结果。这使得预测结果变得“稀疏”。


## 2

![](assets/20250820195147.png)

> We can implement this more efficiently by keeping the filters intact and instead sparsely sample the feature maps on which they are applied on using an input stride of 2 or 4 pixels, respectively. This approach, illustrated in Fig. 1 is known as the ‘hole algorithm’ (‘atrous algorithm’) and has been developed before for efficient computation of the undecimated wavelet transform (Mallat, 1999).

虽然“在卷积核中插入零”是空洞卷积的直观理解，但它不是最快的实现方式。更高效的方式是保持卷积核不变，不要去修改卷积核本身。在应用卷积时，让卷积核**跳跃式地**在输入特征图上进行采样。

这里的 “input stride” 就是我们所说的**空洞率（atrous rate）**。当输入步长为2时，卷积核每隔一个像素进行采样；当输入步长为4时，每隔三个像素进行采样。

## 3

> We replace the 1000-way Imagenet classifier in the last layer of VGG-16 with a 21-way one.

ImageNet 数据集有 1000 个类别，所以 VGG-16 的最后一层（分类器）有 1000 个输出。PASCAL VOC 数据集用于语义分割，有 20 个物体类别和一个背景类别，总共 **21 个类别**。  因此，作者将网络的最后一层修改为一个**输出通道数为 21 的卷积层**，每个通道代表一个类别的分数。



# DETAILED BOUNDARY RECOVERY: FULLY-CONNECTED CONDITIONAL  RANDOM FIELDS AND MULTI-SCALE PREDICTION

## 1

> As illustrated in Figure 2, DCNN score maps can reliably predict the presence and rough position of objects in an image but are less well suited for pin-pointing their exact outline. There is a natural trade-off between classification accuracy and localization accuracy with convolutional networks: Deeper models with multiple max-pooling layers have proven most successful in classification tasks, however their increased invariance and large receptive fields make the problem of inferring position from the scores at their top output levels more challenging.
> 
> Recent work has pursued two directions to address this **localization challenge**. The first approach is to harness information from multiple layers in the convolutional network in order to better estimate the object boundaries (Long et al., 2014; Eigen & Fergus, 2014). The second approach is to employ a super-pixel representation, essentially delegating the localization task to a low-level segmentation method. This route is followed by the very successful recent method of Mostajabi et al. (2014).
> 
> In Section 4.2, we pursue a novel alternative direction based on coupling the recognition capacity of DCNNs and the fine-grained localization accuracy of fully connected CRFs and show that it is remarkably successful in addressing the localization challenge, producing accurate semantic segmentation results and recovering object boundaries at a level of detail that is well beyond the reach of existing methods.
