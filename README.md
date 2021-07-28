# Digits

Digit classification with tensorflow

## Working Example

Check out the application directly in your browser: https://d-costa.gitlab.io/digits/

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

