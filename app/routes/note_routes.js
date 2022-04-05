const { MODAL_TYPE }  = require("../../assets/constants");
const { log } = require("nodemon/lib/utils");
const ObjectId = require('mongodb').ObjectId;

module.exports = function(app, db) {
  const getDateRange = (startDateSend, endDateSend) => {
    let startDay = new Date(startDateSend);
    let endDay = new Date(endDateSend);

    startDay.setHours(0);
    startDay.setMinutes(0);
    startDay.setSeconds(0);

    endDay.setHours(23);
    endDay.setMinutes(59);
    endDay.setSeconds(59);

    return { startDay, endDay };
  }

  //Проверка на залогированного пользователя
  app.post('/user/authorized', (req, res) => {
    const collection = db.collection('users');
    const name = req.body?.userName;

    collection.findOne({ name }, function (err, item) {
      // res.ok вместо result
      if(item != null) {
        res.send({
          result: true,
          user: item
        });
      } else {
        res.send({
          result: false,
          message: 'Такого пользователя не существует',
          type: MODAL_TYPE.TYPE_ERROR
        });
      }
    });
  });

  //Вход пользователя
  app.post('/user/login', (req, res) => {
    const collection = db.collection('users');
    const name = req.body?.name;
    const password = req.body?.password;
    let userExist = false;

    collection.findOne({ name: name }, function (err, item) {
      if(item != null) {
        if(item.password === password) {
          res.send({ result: true, userId: item._id });
        } else {
          res.send({
            result: false,
            message: 'Пароль не совпадает',
            type: MODAL_TYPE.TYPE_ERROR
          });
        }
      } else {
        res.send({
          result: false,
          message: 'Такого пользователя не существует',
          type: MODAL_TYPE.TYPE_ERROR
        });
      }
    });
  });

  //Регистрация пользователя
  app.post('/user/join', (req, res) => {
    const collection = db.collection('users');
    const user = req.body?.user;
    let userExist = false;

    collection.findOne({ name: user.name }, function (err, item) {
      if(item != null) {
        userExist = true;
        res.send({
          result: false,
          message: 'Такой пользователь уже существует',
          type: MODAL_TYPE.TYPE_WARNING
        });
      } else {
        collection.insertOne(user, (err) => {
          if (err) {
            res.send({
              result: false,
              message: 'Internal error',
              type: MODAL_TYPE.TYPE_ERROR
            });
          } else {
            res.send({
              result: true,
              userId: item.id,
              message: 'Поздравляю, регистрация успешно завершена',
              type: MODAL_TYPE.TYPE_INFORMATION
            });
          }
        });
      }
    });
  });

  //Получение данных трекеров
  app.post('/trackers/get', (req, res) => {
    const collection = db.collection('trackers');
    const reqData = req.body?.submitData;
    const dateRange = getDateRange(reqData.startDateSend, reqData.endDateSend);

    collection.find({
      userId: reqData.userId,
      dateSend: {
        $gte: Number(dateRange.startDay),
        $lt: Number(dateRange.endDay)
      }
    }).toArray().then(result => {
      if(result.length > 0) {
        res.send({
          result: true,
          trackers: result
        });
      } else {
        res.send({
          result: false,
          message: 'Не найдена ни одна оценка',
          type: MODAL_TYPE.TYPE_WARNING
        });
      }
    })
  });

  //Сохранение данных трекеров для пользователя
  app.post('/trackers/update', (req, res) => {
    const collection = db.collection('trackers');
    const reqData = req.body?.submitData;
    const dateRange = getDateRange(reqData.dateSend, reqData.dateSend);
    const trackersLimit = reqData.trackersLimit;
    delete reqData.trackersLimit;

    collection.find({
      userId: reqData.userId,
      dateSend: {
        $gte: Number(dateRange.startDay),
        $lt: Number(dateRange.endDay)
      }
    }).toArray().then(result => {
      if(result.length < trackersLimit) {
        collection.insertOne(reqData.tracker, (err) => {
          if (err) {
            res.send({
              result: false,
              message: 'Internal error',
              type: MODAL_TYPE.TYPE_ERROR
            });
          } else {
            res.send({
              result: true,
            });
          }
        });
      } else {
        res.send({
          result: false,
          message: 'Количество оценок за день достигнуто максимума',
          type: MODAL_TYPE.TYPE_WARNING
        });
      }
    });
  });
};
