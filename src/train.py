from datetime import datetime

import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.layers import Input, Dense, Flatten, Conv2D, Dropout, MaxPooling2D, BatchNormalization
from tensorflow.keras import Model
from tensorflow.python.keras.optimizer_v2.gradient_descent import SGD
from tensorflow.python.keras.utils.np_utils import to_categorical
from sklearn.model_selection import train_test_split

batch_size = 16
num_epochs = 50
l_rate = 0.01
momentum = 0.9

mnist = tf.keras.datasets.mnist

(x_train, y_train), (_, _) = mnist.load_data()
x_train = x_train / 255.0

# save 25% of train set as validation
x_train, x_val, y_train, y_val = train_test_split(x_train, y_train, test_size=0.25, stratify=y_train, random_state=1)

y_train = to_categorical(y_train)
y_val = to_categorical(y_val)


# Network
inputs = Input(shape=(28, 28, 1))

layer = Conv2D(32, (5, 5), activation="relu", kernel_initializer='glorot_uniform')(inputs)
layer = MaxPooling2D(pool_size=(2, 2))(layer)

layer = Conv2D(15, (3, 3), activation="relu", kernel_initializer='glorot_uniform')(layer)
layer = MaxPooling2D(pool_size=(2, 2))(layer)

layer = Flatten()(layer)

layer = Dense(128, activation="relu", kernel_initializer='glorot_uniform')(layer)
layer = Dense(10, activation="softmax")(layer)

model = Model(inputs=inputs, outputs=layer)

# optimizer = SGD(learning_rate=l_rate, momentum=momentum)
optimizer = Adam()

model.compile(loss="categorical_crossentropy", optimizer=optimizer, metrics=["accuracy"])
model.summary()

# $> tensorboard --logdir logs
logdir="logs/fit/" + datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = tf.keras.callbacks.TensorBoard(log_dir=logdir)

history = model.fit(x_train, y_train, validation_data=(x_train, y_train),
                    batch_size=batch_size, epochs=num_epochs, callbacks=[tensorboard_callback])

model.save("model.h5")
