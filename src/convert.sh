
tensorflowjs_converter --input_format keras model.h5 tfjs/
mkdir -p ../public/tfjs
mv tfjs/* ../public/tfjs
