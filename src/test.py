import tensorflow as tf
from tensorflow.python.keras.utils.np_utils import to_categorical

# Recreate the exact same model, including its weights and the optimizer
model = tf.keras.models.load_model('model.h5')

mnist = tf.keras.datasets.mnist

(_, _), (x_test, y_test) = mnist.load_data()
x_test = x_test / 255.0
y_test = to_categorical(y_test)

loss, acc = model.evaluate(x_test, y_test, verbose=0)
print("Trained model, loss: {:5.3f}, accuracy: {:5.2f}%".format(loss, 100 * acc))
