const { MODAL_TYPE }  = require("../../assets/constants");
const {log} = require("nodemon/lib/utils");
const ObjectId = require('mongodb').ObjectId;

module.exports = function(app, db) {

  app.post('/notes/post', (req, res) => {
    const collection = db.collection('trackers');
    const note = [
      {
        title: 'Оцените свои эмоции',
        type: 'emotion',
        countPoint: 10
      },
      {
        title: 'Оцените свою продуктивность',
        type: 'production',
        countPoint: 10
      },
      {
        title: 'Оцените своё самочувствие',
        type: 'myself',
        countPoint: 10
      },
      {
        title: 'Оцените своё состояние',
        type: 'quality',
        countPoint: 10
      }
    ];
    collection.insertMany(note, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send(result);
      }
    });

  });

  app.get('/notes/get', (req, res) => {
    const collection = db.collection('trackers');
    // const id = req.params.id;
    // const details = { '_id': new ObjectId(id) };
    collection.find().toArray(function(err, item) {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        res.send(item);
      }
    });
  });

  app.get('/sessions/authorized', (req, res) => {
    const collection = db.collection('sessions');
    const userName = req.body.userName;
    let details;

    if(userName != null) details = { userName };
    else details = { 'isAuthorized': true };

    collection.findOne(details, function (err, item) {
      if (err) {
        res.send({'error': 'An error has occurred'});
      } else {

        res.send({ isAuthorized: item != null ? item.isAuthorized : false });
      }
    });
  });

  //Регистрация пользователя
  app.post('/user/join', (req, res) => {
    const collection = db.collection('users');
    const user = req.body?.user;
    let userExist = false;

    // Создаётся объект promise
    collection.findOne({ name: user.name }, function (err, item) {
      if(item != null) {
        userExist = true;
        console.log('1',userExist)
        res.send({
          result: false,
          message: 'Такой пользователь уже существует',
          type: MODAL_TYPE.TYPE_WARNING
        });
      } else {
        collection.insertOne(user, (err) => {
          console.log('2',userExist)
          if (err) {
            res.send({
              result: false,
              message: 'An error has occurred',
              type: MODAL_TYPE.TYPE_ERROR
            });
          } else {
            res.send({
              result: true,
              message: 'Поздравляю, регистрация успешно завершена',
              type: MODAL_TYPE.TYPE_INFORMATION
            });
          }
        });
      }
    });
  });
};