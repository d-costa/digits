from datetime import datetime

import tensorflow as tf
from sklearn.model_selection import train_test_split
from tensorflow.keras import Model
from tensorflow.keras.layers import Input, Dense, Flatten, Conv2D, BatchNormalization, Dropout, MaxPool2D
from tensorflow.python.keras.utils.np_utils import to_categorical

batch_size = 64
num_epochs = 25
validation_size = 0.16

mnist = tf.keras.datasets.mnist

(x_train, y_train), (_, _) = mnist.load_data()
x_train = x_train / 255.0

# save 25% of train set as validation
x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size=0.25, stratify=y_train, random_state=1)

y_train = to_categorical(y_train)
y_val = to_categorical(y_val)

# Network
inputs = Input(shape=(28, 28, 1))

layer = Conv2D(32, (3, 3), activation="relu")(inputs)
layer = MaxPool2D()(layer)

layer = Conv2D(16, (3, 3), activation="relu")(layer)
layer = MaxPool2D()(layer)

layer = Flatten()(layer)

layer = Dense(128, activation="relu")(layer)

layer = Dense(10, activation="softmax")(layer)

model = Model(inputs=inputs, outputs=layer)

model.compile(loss="categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
model.summary()

# $> tensorboard --logdir logs
logdir = "logs/fit/" + datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=logdir)

history = model.fit(x_train, y_train, validation_data=(x_val, y_val),
                    batch_size=batch_size, epochs=num_epochs, callbacks=[tensorboard_callback])

model.save("model.h5")
