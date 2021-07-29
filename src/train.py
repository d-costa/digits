from datetime import datetime

import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.layers import Input, Dense, Flatten, Conv2D, Dropout, MaxPooling2D
from tensorflow.keras import Model
from tensorflow.python.keras.utils.np_utils import to_categorical

batch_size = 32
num_epochs = 15

mnist = tf.keras.datasets.mnist

(x_train, y_train), (_, _) = mnist.load_data()
x_train = x_train / 255.0
y_train = to_categorical(y_train)


# Network
inputs = Input(shape=(28, 28, 1))

layer = Conv2D(32, (5, 5), padding="same", activation="relu")(inputs)
layer = MaxPooling2D(pool_size=(2, 2))(layer)

layer = Conv2D(32, (3, 3), padding="same", activation="relu")(layer)
layer = MaxPooling2D(pool_size=(2, 2))(layer)

layer = Flatten()(layer)

layer = Dense(128, activation="relu")(layer)
layer = Dense(10, activation="softmax")(layer)


model = Model(inputs=inputs, outputs=layer)

optimizer = Adam()

model.compile(loss="categorical_crossentropy", optimizer=optimizer, metrics=["categorical_accuracy"])
model.summary()

# $> tensorboard --logdir logs
logdir="logs/fit/" + datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=logdir)

history = model.fit(x_train, y_train, validation_data=(x_train, y_train),
                    batch_size=batch_size, epochs=num_epochs, callbacks=[tensorboard_callback])

model.save("model.h5")
