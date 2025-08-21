```embed
title: "DeepLab: Semantic Image Segmentation with Deep Convolutional Nets, Atrous Convolution, and Fully Connected CRFs"
image: "https://arxiv.org/static/browse/0.3.4/images/arxiv-logo-fb.png"
description: "In this work we address the task of semantic image segmentation with Deep Learning and make three main contributions that are experimentally shown to have substantial practical merit. First, we highlight convolution with upsampled filters, or 'atrous convolution', as a powerful tool in dense prediction tasks. Atrous convolution allows us to explicitly control the resolution at which feature responses are computed within Deep Convolutional Neural Networks. It also allows us to effectively enlarge the field of view of filters to incorporate larger context without increasing the number of parameters or the amount of computation. Second, we propose atrous spatial pyramid pooling (ASPP) to robustly segment objects at multiple scales. ASPP probes an incoming convolutional feature layer with filters at multiple sampling rates and effective fields-of-views, thus capturing objects as well as image context at multiple scales. Third, we improve the localization of object boundaries by combining methods from DCNNs and probabilistic graphical models. The commonly deployed combination of max-pooling and downsampling in DCNNs achieves invariance but has a toll on localization accuracy. We overcome this by combining the responses at the final DCNN layer with a fully connected Conditional Random Field (CRF), which is shown both qualitatively and quantitatively to improve localization performance. Our proposed \"DeepLab\" system sets the new state-of-art at the PASCAL VOC-2012 semantic image segmentation task, reaching 79.7% mIOU in the test set, and advances the results on three other datasets: PASCAL-Context, PASCAL-Person-Part, and Cityscapes. All of our code is made publicly available online."
url: "https://arxiv.org/abs/1606.00915"
favicon: "https://arxiv.org/static/browse/0.3.4/images/icons/favicon-32x32.png"
aspectRatio: "0"
```

# RELATED WORK

## 1

> The first family of DCNN-based systems for semantic segmentation typically employs a cascade of **bottom-up image segmentation**, followed by DCNN-based **region classification**. For instance the bounding box proposals and masked regions delivered by [47], [48] are used in [7] and [49] as inputs to a DCNN to incorporate shape information into the classification process. Similarly, the authors of [50] rely on a superpixel representation. Even though these approaches can benefit from the sharp boundaries delivered by a good segmentation, they also cannot recover from any of its errors.
>
> The second family of works relies on using convolutionally computed DCNN features for dense image labeling, and couples them with segmentations that are obtained independently. Among the first have been [39] who apply DCNNs at multiple image resolutions and then employ a segmentation tree to smooth the prediction results. More recently, [21] propose to use skip layers and concatenate the computed intermediate feature maps within the DCNNs for pixel classification. Further, [51] propose to pool the intermediate feature maps by region proposals. These works still employ segmentation algorithms that are **decoupled** from the DCNN classifier’s results, thus risking commitment to **premature decisions**.
>
> The third family of works uses DCNNs to directly provide dense category-level pixel labels, which makes it possible to even discard segmentation altogether. The segmentation-free approaches of [14], [52] directly apply DCNNs to the whole image in a fully convolutional fashion, transforming the last fully connected layers of the DCNN into convolutional layers. In order to deal with the **spatial localization issues** outlined in the introduction, [14] **upsample and concatenate** the scores from intermediate feature maps, while [52] refine the prediction result **from coarse to fine** by propagating the coarse results to another DCNN. Our work builds on these works, and as described in the introduction extends them by exerting **control on the feature resolution**, introducing **multi-scale pooling** techniques and **integrating the densely connected CRF** of [22] on top of the DCNN. We show that this leads to significantly etter segmentation results, especially along object boundaries. The combination of DCNN and CRF is of course not new but previous works only tried **locally connected CRF** models. Specifically, [53] use CRFs as a proposal mechanism for a DCNN-based reranking system, while [39] treat uperpixels as nodes for a local pairwise CRF and use graph-cuts for discrete inference. As such their models were limited by errors in superpixel computations or ignored **long-range dependencies**. Our approach instead treats every pixel as a CRF node receiving unary potentials by the DCNN. Crucially, the Gaussian CRF potentials in the **fully connected CRF** model of [22] that we adopt can capture long-range dependencies and at the same time the model is amenable to **fast mean field inference**. We note that mean field inference had been extensively studied for traditional image segmentation tasks [54], [55], [56], but these older models were typically limited to short range connections. In independent work, [57] use a very similar densely connected CRF model to refine the results of DCNN for the problem of material classification. However, the DCNN module of [57] was only trained by sparse point supervision instead of dense supervision at every pixel.



这部分主要讲语义分割领域在 DeepLab 论文发表前的三种主要技术路线。

1. 先分割，后分类

   第一步：图像分割。这一步是自下而上的，通常使用传统的图像处理算法（而不是深度学习）将图像分割成多个不重叠的区域。这些区域的边界通常是比较清晰的。

   第二步：区域分类。将上一步得到的每个区域作为输入，送入一个 DCNN 进行分类。DCNN 的作用是为每个区域确定其对应的语义类别。

   如果第一步的分割算法足够好，它可以提供非常清晰的物体边界，从而帮助 DCNN 更好地理解物体的形状信息。但这种方法的致命弱点在于，**它完全依赖于第一步分割的结果**。如果分割算法本身就出了错（比如把一个物体分割成了两半，或者把两个相邻物体合二为一），DCNN 在第二步是无法纠正这个错误的。

2. DCNN 特征与独立分割的结合

   这类方法开始尝试将 DCNN 的优势引入到像素级别的标注中，但**仍然将分割和分类作为两个相对独立的模块**。这类方法利用 DCNN 来计算图像的密集特征，为每个像素提供一个分类的“分数”或“可能性”。在 DCNN 得到像素级别的预测结果之后，再使用一个独立的分割算法（比如分割树、超像素等）来“平滑”或“精炼”这些结果，以获得更好的边界和区域一致性。

   相比第一类方法，DCNN 在这里的作用更直接，它可以为每个像素提供丰富的特征信息。但**分割算法与 DCNN 分类器仍然是解耦的**。这意味着在分类和分割这两个关键步骤之间缺乏紧密的反馈和协作。这种分离可能会导致**过早地做出决策**，即 DCNN 在早期预测中犯下的错误，后面的分割算法很难完全弥补。

3. 全卷积网络

   这类方法是语义分割领域的重大突破，它直接使用 DCNN 来完成**端到端**的像素级标注。核心思想是**全卷积网络（FCN）**。它将 DCNN 中用于分类的全连接层替换为卷积层，使得网络可以接受任意尺寸的图像输入，并直接输出相同尺寸的、稠密的像素预测图。**这完全摒弃了独立分割算法的必要性**。

   [14] 和 [52] 都是全卷积网络的早期代表作。它们面临的问题是如何解决引言中提到的**空间定位问题**。[14] 的做法是**上采样并拼接**不同层级的特征图（类似于 U-Net 的思想），来恢复空间信息。[52] 的做法是**从粗到细**地精炼预测结果，将粗糙的预测结果传递给另一个 DCNN 进行细化。

DeepLab 的主要贡献有：

- **控制特征分辨率**

  通过引入**空洞卷积（atrous convolution）**，DeepLab 能够直接在网络内部控制特征图的分辨率，避免了传统 FCN 中因池化而导致的空间信息丢失。

- **多尺度池化**

  使用**ASPP（Atrous Spatial Pyramid Pooling）** 模块，通过不同扩张率的空洞卷积来捕捉不同尺度的上下文信息，这对于识别不同大小的物体至关重要。

- **全连接 CRF 的集成**

  CRF（条件随机场）是一种结构化预测模型，它的主要作用是**平滑预测结果**，并确保相邻像素的预测结果具有空间一致性。这对于修复 DCNN 输出中模糊的边界非常有效。

  在 DeepLabv1 之前，研究人员将 DCNN 和 CRF 结合时，通常就是使用超像素作为“节点”。他们先用超像素算法将图像分割成一个个小区域。然后，CRF 模型就建立在这些超像素之上，只考虑**相邻超像素**之间的关系。

  DeepLabv1 认为这种**“局部连接的 CRF”**依赖于超像素算法的质量，并且由于只考虑相邻节点，无法捕捉到图像中**长距离的依赖关系**（比如一个物体的两端，虽然相隔较远，但它们应该属于同一类别）。因此，DeepLabv1 采用了**全连接 CRF**，将图像中的**每一个像素**都作为节点，从而避免了超像素算法的潜在错误，并能有效地捕捉到长距离的依赖关系，以获得更精细、更准确的分割结果。



> [!note]
>
> 在传统的图像处理中，我们处理图像的基本单位是**像素**，每个像素都有自己的颜色和位置信息。然而，在许多任务中，单独处理每一个像素的计算量非常大，而且相邻的像素往往具有相似的颜色和纹理，属于同一个物体或区域。
>
> **超像素算法（Superpixel Algorithm）**的目的就是解决这个问题。它将图像中具有相似颜色、亮度、纹理等特征的相邻像素聚集成一个更大的、具有感知意义的“小块”，这个小块就被称为“超像素”。
>
> 超像素的作用和优势
>
> 1. **减少计算量**：通过将成百上千个像素聚合成几十个或几百个超像素，后续的算法不再需要处理海量的像素，而是只需处理数量少得多的超像素，从而大大降低了计算复杂度。
> 2. **保留感知边界**：与简单地把图像切成正方形网格不同，超像素的边界通常能很好地贴合物体的自然边界。这使得它们在后续处理中能更好地保留物体的形状信息。
> 3. **提供区域信息**：一个超像素作为一个整体，可以被赋予一个平均颜色、纹理或其他特征，这比单独处理每个像素更有意义。


## 2

> End-to-end training for structured prediction

结构化预测的端到端训练

- 结构化预测

  **预测**是机器学习的基本任务。大多数传统的机器学习模型，比如分类器，都属于**非结构化预测**。它们的目标是预测一个**单一的、独立的**输出标签，例如：给一张图片，预测这是“狗”还是“猫”。然而，现实世界中的许多问题，其输出不是一个简单的标签，而是一个**具有内部关联性或结构**的复杂对象。这就是**结构化预测**要解决的问题。它的输出通常是一个序列、一棵树、一个图或者一个稠密的像素网格。例如语义分割和目标检测。

  结构化预测的关键在于，输出的每个部分都不是独立的，而是相互依赖的。

- 端到端训练

  “端到端”指的是一个系统从**输入**到**输出**的整个流程，中间没有人工干预或额外的、独立的模块。

  **非端到端训练**：传统的机器学习流水线通常包含多个独立的阶段。例如，在传统计算机视觉中，你可能先用**手工设计**的算法提取图像特征（如 SIFT 或 HOG），然后将这些特征输入一个独立的分类器（如 SVM）进行训练。这两个阶段是**分开训练和优化的**。

  **端到端训练**：在端到端训练中，整个模型（从原始输入数据到最终输出结果）被视为一个**单一的、可微分的**计算图。模型的所有参数，包括特征提取和最终预测部分的参数，都通过反向传播和梯度下降一起进行优化。这意味着模型可以自动地从数据中学习最佳的特征表示和预测规则，而无需人工干预。

- 结构化预测的端到端训练

  “结构化预测的端到端训练”指的是使用一个单一的、可微分的网络模型，直接从原始输入数据学习，并输出一个具有内部结构的复杂预测结果，同时整个过程的所有参数都通过一个统一的损失函数进行优化。

# METHODS

## 1

> Atrous Convolution for **Dense Feature Extraction** and **Field-of-View Enlargement**

**密集特征提取**：

在语义分割等**密集预测任务**中，我们的目标是为图像中的**每一个像素**都提供一个预测结果（例如，一个类别标签）。传统的 DCNN，如 AlexNet、VGG 等，通过反复使用**最大池化**和**步长为2的卷积**来下采样特征图。这种操作会**显著降低**特征图的空间分辨率。

分辨率降低导致了两个严重问题：

1. **特征稀疏**：我们无法为每个像素都得到一个对应的特征向量，而是每隔 32 个像素才有一个特征向量。这使得**特征提取变得稀疏**，而不是**密集**。
2. **定位精度差**：由于特征图的分辨率过低，网络很难精确地恢复出原始图像中物体的精细边界。

----

**感受野扩大**：

在语义分割任务中，模型不仅需要知道一个像素本身的特征，还需要知道它**周围的上下文信息**。例如，要判断一个像素是不是“人”，你可能需要看到它周围有“头”、“手”或“腿”。

感受野是指一个神经元的在原始输入图像上所对应的区域大小。感受野越大，神经元能看到的上下文信息就越多。

## 2

$$
y[i]=\sum_{k=1}^{K} x[i+r \cdot k] w[k]
$$

-  $x[i]$：输入信号在位置  $i$  处的值。

-  $w[k]$：卷积核（滤波器）在位置  $k$  处的值，卷积核的长度为  $K$  。

-  $r$ （rate 参数）：这就是空洞率。它决定了卷积核在输入信号上＂跳过＂多少个值。

-  $i+r \cdot k$：这就是空洞卷积的精髓。在标准卷积中 (r=1)，卷积核会与输入信号的连续元素进行相乘求和，即 $x[i+k]$ 。但在空洞卷积中，它会以步长 $r$ 来跳跃式地从输入信号中采样元素，例如，当 $r=2$ 时，卷积核会与 $x[i+2 k]$ 相乘。


  $r=1$ 的特殊情况：当空洞率 $r=1$ 时，公式就退化为标准卷积的定义。
![](assets/20250815161031.png)

## 3


> Instead, we can compute responses at all image positions if we convolve the full resolution image with a filter ‘with holes’, in which we upsample the original filter by a factor of 2, and introduce zeros in between filter values. Although the effective filter size increases, we only need to take into account the non-zero filter values, hence both the number of filter parameters and the number of operations per position stay constant. The resulting scheme allows us to easily and explicitly control the spatial resolution of neural network feature responses.

空洞卷积放弃了先下采样再卷积的传统做法，而是**直接在全分辨率的图像上进行卷积**。

为了在不增加参数和计算量的情况下扩大感受野，空洞卷积对**滤波器（卷积核）**本身进行了改造。它将原始滤波器**“上采样”**，并在滤波器元素之间**插入零**，从而形成一个**“带孔洞”**的、有效尺寸更大的滤波器。

> Although the effective filter size increases, we only need to take into account the non-zero filter values, hence both the number of filter parameters and the number of operations per position stay constant. The resulting scheme allows us to easily and explicitly control the spatial resolution of neural network feature responses.

- **不增加计算量**：这是空洞卷积最巧妙的地方。虽然滤波器变大了，但由于我们只用**非零的参数**去进行乘法运算，所以**实际的计算量和参数数量**与使用原始滤波器时是完全一样的。
  
- **控制分辨率**：由于这种方法不进行下采样，网络可以**保持原始图像的高分辨率**。论文中提到，这使得我们可以“轻松且显式地控制”特征图的分辨率。我们可以通过调整空洞率来获得不同大小的感受野，而分辨率始终由我们自己决定。


## 4

> Still, explicitly accounting for object scale can improve the DCNN’s ability to successfully handle both large and small objects [6].
> 
> We have experimented with two approaches to handling scale variability in semantic segmentation. The first approach amounts to **standard multiscale processing** [17], [18]. We extract DCNN score maps from multiple (three in our experiments) rescaled versions of the original image using **parallel DCNN branches that share the same parameters**. To produce the final result, we bilinearly interpolate the feature maps from the parallel DCNN branches to the original image resolution and fuse them, by taking at each position the maximum response across the different scales. We do this both during training and testing. Multiscale processing significantly improves performance, but at the cost of computing feature responses at all DCNN layers for multiple scales of input.
> 
> The second approach is inspired by the success of the R-CNN **spatial pyramid pooling** method of [20], which showed that regions of an arbitrary scale can be accurately and efficiently classified by resampling convolutional features extracted at a single scale. We have implemented a variant of their scheme which uses **multiple parallel atrous convolutional layers** with different sampling rates. The features extracted for each sampling rate are further processed in separate branches and fused to generate the final result. The proposed “**atrous spatial pyramid pooling**” (DeepLab-ASPP) approach generalizes our DeepLab-LargeFOV variant and is illustrated in Fig. 4.

当模型需要同时识别图像中的大型物体（如汽车）和小型物体（如交通标志）时，如果只用单一尺度的特征，要么对大物体识别不全，要么对小物体识别不准。

1. 解决方案一：**标准多尺度处理**

   多尺度处理将同一张原始图像缩放成多个不同的尺寸（例如，1倍、0.5倍、2倍）。将这几个不同尺寸的图像，分别送入多个**并行且共享参数**的 DCNN 分支进行处理。将每个分支得到的特征图都**双线性插值**到原始图像的分辨率，然后在**每个像素位置**上，取不同尺度下的最大响应值作为最终结果。

   这种方法能显著提高性能，因为它确保了模型能够从多个尺度来观察物体。代价是巨大的计算量。你需要为**每一个输入尺度**都运行一次完整的网络，这在训练和测试时都非常耗时和耗费资源。

2. 解决方案二：**空洞空间金字塔池化**

   ASPP 的设计灵感来自**R-CNN**中的**空间金字塔池化 SPP**。SPP 的核心思想是，**在单次前向传播中**从一张图像中提取特征，然后通过重采样来处理不同尺度的区域，从而避免了对同一张图片进行多次缩放和处理。

   DeepLabv1 将 SPP 的思想与**空洞卷积**结合起来，提出了 ASPP。不像第一种方法那样对多张图片进行处理，ASPP 只处理**一张单尺度**的特征图。它使用多个**并行的空洞卷积分支**。每个分支的空洞卷积使用**不同的空洞率**。将这几个并行分支得到的特征图进行融合（例如，拼接），生成最终的预测结果。

## 5

> As illustrated in Fig. 5, DCNN score maps can predict the presence and rough position of objects but cannot really delineate their borders.

传统 DCNN 在语义分割任务中的一个核心局限性是 DCNN 只能预测“存在”和“大致位置”。造成这个局限的核心原因在于 DCNN 的**下采样**操作，特别是**最大池化**和**步长大于1的卷积**。

- **信息压缩**：DCNN 的设计初衷是为了**图像分类**。在分类任务中，我们的目标是识别图像中有什么，而不关心物体具体在哪里。因此，网络会通过下采样操作，将**空间信息**（物体在哪里）压缩成**语义信息**（物体是什么）。
    
- **分辨率损失**：这种下采样会**显著降低特征图的分辨率**。例如，一张 512×512 的图片，经过多次下采样后，最后用于预测的特征图可能只有 16×16。这意味着原始图像中的一个像素，在最终的特征图中可能没有对应的点。
    
- **精细信息的丢失**：在池化操作中，我们只保留了区域内的最大值，而**丢弃了其他所有信息**。这种激进的压缩导致了大量关于物体**精确位置和边界**的细粒度信息丢失。

DCNN 的这个局限性在语义分割中被称为 **“像素级定位精度不足”**。即使像 FCN 这样的全卷积网络试图通过**反卷积**来恢复分辨率，但它也只是**粗略地恢复**，而无法弥补在下采样过程中已经丢失的精细边界信息。

## 6

> Previous work has pursued two directions to address this localization challenge. The first approach is to harness information from multiple layers in the convolutional network in order to better estimate the object boundaries [14], [21], [52]. The second is to employ a super-pixel representation, essentially delegating the localization task to a lowlevel segmentation method [50].

多层信息融合方法的核心思想是：**“深层”负责“是什么”，而“浅层”负责“在哪里”**。

- **深层**：在 DCNN 中，深层经过了多次卷积和池化，因此它们具有**非常大的感受野**。这使得深层特征能够捕捉到**高级别的语义信息**，例如一个物体是什么（“狗”、“汽车”等）。然而，由于分辨率低，这些深层特征丢失了精确的空间位置信息。 
- **浅层**：在网络的前几层，特征图的分辨率仍然很高。这些浅层特征捕捉的是**低级别的视觉信息**，例如边缘、颜色和纹理。虽然它们不知道物体是什么，但它们**精确地保留了物体边界的细节**。

这种方法的具体操作就是**将不同层的特征图进行融合**。最典型的例子就是**FCN**和**U-Net**。


超像素方法的核心思想是：**“定位”交给传统算法，“分类”交给深度学习**。

- **超像素**：首先，使用一些传统的、非深度学习的算法（如 SLIC、Felzenszwalb 等），将图像分割成许多具有**相似颜色、亮度和纹理**的**小区域**，这些区域就被称为**超像素**。超像素的边界通常能够很好地贴合图像中物体的自然边界。
    
- **操作**：首先，对输入的图像进行超像素分割，得到一系列超像素。然后，对每个超像素，使用 DCNN 提取其特征，并进行分类。由于 DCNN 不再需要逐像素地预测，而是处理一个预先分割好的“块”，其任务就简化了。由于每个超像素内的所有像素都被赋予相同的类别标签，而超像素的边界又相对精确，所以最终得到的分割结果边界也会比较清晰。

这种方法的本质是将语义分割这个复杂的任务分解为两个独立的、更简单的任务，即**先由一个传统的、低级的分割算法来完成边界的定位任务，再由 DCNN 来完成更高级的分类任务**。