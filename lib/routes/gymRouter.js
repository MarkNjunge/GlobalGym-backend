//@ts-check
const geolib = require("geolib");
const router = require("express").Router();
const { check, query } = require("express-validator/check");

const Gym = require("./../database/models/gym");
const { paramsMiddleware } = require("./middlewares");

router.get("/", (req, res) => {
  Gym.findAll()
    .then(result => res.send(result))
    .catch(err => res.status(500).send({ message: err.message }));
});

router.get(
  "/nearby",
  [
    query(["country", "lat", "lng", "radius"])
      .exists()
      .withMessage("Required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.findAll({ country: req.query.country })
      .then(gyms => {
        const inRadius = [];
        gyms.forEach(gym => {
          const distance = geolib.getDistance(
            { latitude: req.query.lat, longitude: req.query.lng },
            { latitude: gym.cords.lat, longitude: gym.cords.lng }
          );

          if (distance < req.query.radius) {
            inRadius.push(gym.gymId);
          }
        });

        return inRadius;
      })
      .then(inRadius => Gym.findAllIn(inRadius))
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

router.get(
  "/search",
  [
    query("name")
      .exists()
      .withMessage("Name query param is required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.findSearch(req.query.name)
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

router.get("/:id", (req, res) => {
  Gym.findOne(req.params.id)
    .then(result => res.send(result))
    .catch(err => res.status(500).send({ message: err.message }));
});

router.post(
  "/create",
  [
    check([
      "name",
      "logo",
      "phone",
      "website",
      "openTime",
      "closeTime",
      "country",
      "city",
      "cords"
    ])
      .exists()
      .withMessage("Required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.create(
      req.body.name,
      req.body.logo,
      req.body.phone,
      req.body.website,
      req.body.openTime,
      req.body.closeTime,
      req.body.country,
      req.body.city,
      req.body.cords
    )
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

router.post(
  "/update",
  [
    check("gymId")
      .exists()
      .withMessage("Required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.update(req.body.gymId, req.body)
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

router.post(
  "/images/add",
  [
    check(["gymId", "imageUrl"])
      .exists()
      .withMessage("Required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.addImage(req.body.gymId, req.body.imageUrl)
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

router.post(
  "/images/remove",
  [
    check(["gymId", "imageUrl"])
      .exists()
      .withMessage("Required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.removeImage(req.body.gymId, req.body.imageUrl)
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

router.post(
  "/instructors/add",
  [
    check(["gymId", "instructorId"])
      .exists()
      .withMessage("Required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.addInstructor(req.body.gymId, req.body.instructorId)
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

router.post(
  "/instructors/remove",
  [
    check(["gymId", "instructorId"])
      .exists()
      .withMessage("Required.")
  ],
  paramsMiddleware,
  (req, res) => {
    Gym.removeInstructor(req.body.gymId, req.body.instructorId)
      .then(result => res.send(result))
      .catch(err => res.status(500).send({ message: err.message }));
  }
);

module.exports = router;
