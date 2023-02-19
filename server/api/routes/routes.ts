import express from "express";
import controller from "../controllers/users";
const router = express.Router();

router.get("/users", controller.getAllUsers);
// router.get("/posts/:id", controller.getPost);
// router.put("/posts/:id", controller.updatePost);
// router.delete("/posts/:id", controller.deletePost);
// router.post("/posts", controller.addPost);

export default router;
