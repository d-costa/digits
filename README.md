# Digits

Digit classification with tensorflow.

## Working Example

Check out the application directly in your browser: https://d-costa.gitlab.io/digits/

## Technical description

## Usage

1. Install the required python packages:
   ```shell
   pip install -r requirements.txt
   ```

1. Modify the model architecture in [train.py](src/train.py) and train the model:
   ```shell
   python train.py
    ```
   The model is saved in a file named *model.h5*.

1. Test the trained model:
   ```shell
   python test.py
    ```

1. Convert the model to use it in tensorflowjs:
      ```shell
   ./convert.sh
    ```
   The model is saved in */public/tfjs*

1. Open index.html in your browser


## Deep learning model

The [MNIST](http://yann.lecun.com/exdb/mnist/) is used for training a CNN network with the following architecture:

| Layer                      | Output Shape        | Param # |
| -------------------------- | ------------------- | ------- |
| InputLayer                 | [(None, 28, 28, 1)] | 0       |
| Conv2D (32, (5, 5), relu)  | (None, 24, 24, 32)  | 832     |
| MaxPooling2D (2,2)         | (None, 12, 12, 32)  | 0       |
| Conv2D (32, (3, 3), relu)  | (None, 10, 10, 16)  | 4624    |
| MaxPooling2                | (None, 5, 5, 16)    | 0       |
| Flatten                    | (None, 400)         | 0       |
| Dense  (relu)              | (None, 128)         | 51328   |
| Dense  (softmax)           | (None, 10)          | 1290    |

Total params: 58,074
Trainable params: 58,074
Non-trainable params: 0

The training set is split in 75/25 for training and validation.
Adam is used as the optimizer with 20 epochs and batch size of 16.

Test loss: 0.074  
Test accuracy: 98.91%
