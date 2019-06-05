import json
import os
import sys

from django.shortcuts import render
from django.http import HttpResponse
from django.http import HttpResponseRedirect



# Create your views here.

def index(request):
    return render(
        request,
        'visual.html',
    )


def addrow(request):

    rowspath = "/root/server/altground/predict/ann/rows/"

    ltdir = os.listdir( rowspath )

    ret = "["

    for name in ltdir:
        fd = open(rowspath + name,'r')
        ret = ret + fd.read() + ','
        fd.close()

    if len(ltdir) != 0 :
        ret = ret[0:-1]

    ret = ret + "]"

    return HttpResponse( ret,
        content_type="application/json")


def split_sequence(sequence, n_steps):
    from numpy import array
    X, y = list(), list()
    for i in range(len(sequence)):
        # find the end of this pattern
        end_ix = i + n_steps
        # check if we are beyond the sequence
        if end_ix > len(sequence)-1:
            break
        # gather input and output parts of the pattern
        seq_x, seq_y = sequence[i:end_ix], sequence[end_ix]
        X.append(seq_x)
        y.append(seq_y)
    return array(X), array(y)


def make_predict(raw_seq):
    from numpy import array
    from keras.models import Sequential
    from keras.layers import Dense
    from keras.layers import Flatten

    n_steps = 3
    X, y = split_sequence(raw_seq, n_steps)

    n_features = 1


    model = Sequential()
    model.add(Dense(32, input_dim = n_steps, activation='relu'))
    model.add(Dense(16, activation='relu'))
    model.add(Dense(8, activation='softmax'))
    model.add(Dense(1))
    model.compile(optimizer='adam', loss='mse')
    
    history = model.fit(X, y, epochs=100, verbose=0)
    
    predict = []

    x_input = array( [[raw_seq[len(raw_seq) - 3], raw_seq[len(raw_seq) - 2], raw_seq[len(raw_seq) - 1]]] )
    predict.append(    model.predict( x_input , verbose=0)[0][0] )
    x_input = array( [[raw_seq[len(raw_seq) - 2], raw_seq[len(raw_seq) - 1], predict[0]]] )
    predict.append(    model.predict( x_input , verbose=0)[0][0] )
    x_input = array( [[raw_seq[len(raw_seq) - 1], predict[0], predict[1]]] )
    predict.append(    model.predict( x_input , verbose=0)[0][0] )

    for i in range(45):
        x_input = array( [[ predict[i], predict[i + 1], predict[i + 2]]] )
        predict.append( model.predict( x_input , verbose=0)[0][0] )

    return predict




def takerow(request):

    some = '{}'

    if request.is_ajax():
        if request.method == 'POST':
            some = ((str(request.body))[2:])[:-1]
    
    some = json.loads(some)

    some["l"]["p"] = make_predict( some["l"]["r"] )


    smin = some["min"]
    some["statusnow"] = 0
    statusnow = float(some["l"]["r"][ len(some["l"]["r"]) - 1] + smin)

    if float(statusnow) >  float(some["w"]) :
        some["statusnow"] = 1

    if float(statusnow) >  float(some["d"]) :
        some["statusnow"] = 2

    status24 = some["l"]["p"][ len(some["l"]["p"]) - 1]  + smin
    some["status24"] = 0

    if float(status24) > float(some['w']) :
        some["status24"] = 1
    if float(status24) > float(some['d']) :
        some["status24"] = 2

    sn = 0
    sw = 0
    sd = 0

    for item in some["l"]["r"] :
        if float(item + smin) > float(some['d']):
            sd += 1
        elif float(item + smin) > float(some['w']):
            sw += 1
        else :
            sn += 1

    for item in some["l"]["p"] :
        if float(item + smin) > float(some['d']):
            sd += 1
        elif float(item + smin) > float(some['w']):
            sw += 1
        else :
            sn += 1


    some["g"] = {
        "p": sn,
        "w": sw,
        "d": sd,
    }

    some["l"]["d"] = float(some["d"]) - smin
    some["l"]["w"] = float(some["w"]) - smin

    cpath = "/root/server/altground/predict/ann/count.txt"
    rowspath = "/root/server/altground/predict/ann/rows/"

    cf = open(cpath,'r+')
    count = int(cf.read()) + 1
    cf.close()


    cf = open(cpath,'w')
    cf.write(str(count) )
    cf.close()


    wf = open( rowspath + str(count) + '.json', 'w' )
    wf.write((str( some )).replace("\'", "\""))
    wf.close()

    print('4')
    
    return HttpResponse(
        'OK'
        )