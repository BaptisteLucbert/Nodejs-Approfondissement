const request = require("supertest");
const { app } = require("../server");
const jwt = require("jsonwebtoken");
const config = require("../config");
const mockingoose = require("mockingoose");
const Article = require("../api/articles/articles.schema");
const User = require("../api/users/users.model");
const articlesService = require("../api/articles/articles.service");

describe("tester API articles", () => {
  let token;
  const USER_ID = "fake123";
  const ARTICLE_ID = "article123";

  const MOCK_USER = {
    _id: USER_ID,
    name: "John Doe",
    email: "john@test.com",
    role: "admin",
  };

  const MOCK_ARTICLE_DATA = {
    title: "Test Article",
    content: "This is a test article content",
    status: "draft",
    user: USER_ID,
  };

  const MOCK_ARTICLE_CREATED = {
    _id: ARTICLE_ID,
    title: "Test Article",
    content: "This is a test article content",
    status: "draft",
    user: USER_ID,
  };

  const MOCK_ARTICLES = [
    {
      _id: ARTICLE_ID,
      title: "Test Article",
      content: "This is a test article content",
      status: "draft",
      user: USER_ID,
    },
  ];

  beforeEach(() => {
    token = jwt.sign({ userId: USER_ID }, config.secretJwtToken);

    // Mock User pour le middleware d'authentification
    mockingoose(User).toReturn(MOCK_USER, "findOne");

    // Mock Article
    mockingoose(Article).toReturn(MOCK_ARTICLE_CREATED, "save");
    mockingoose(Article).toReturn(MOCK_ARTICLE_CREATED, "findOneAndUpdate");
    mockingoose(Article).toReturn({ deletedCount: 1 }, "deleteOne");
  });

  test("[Articles] Create Article", async () => {
    const res = await request(app)
      .post("/api/articles")
      .send(MOCK_ARTICLE_DATA)
      .set("x-access-token", token);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(MOCK_ARTICLE_DATA.title);
  });

  test("[Articles] Update Article", async () => {
    const updatedData = {
      title: "Updated Article Title",
      status: "published",
    };

    const res = await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .send(updatedData)
      .set("x-access-token", token);

    expect(res.status).toBe(200);
  });

  test("[Articles] Delete Article", async () => {
    const res = await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token);

    expect(res.status).toBe(204);
  });

  test("[Articles] Create Article - Test Service Call", async () => {
    const spy = jest
      .spyOn(articlesService, "create")
      .mockResolvedValue(MOCK_ARTICLE_CREATED);

    await request(app)
      .post("/api/articles")
      .send(MOCK_ARTICLE_DATA)
      .set("x-access-token", token);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("[Articles] Update Article - Test Service Call", async () => {
    const spy = jest
      .spyOn(articlesService, "update")
      .mockResolvedValue(MOCK_ARTICLE_CREATED);

    await request(app)
      .put(`/api/articles/${ARTICLE_ID}`)
      .send({ title: "Updated" })
      .set("x-access-token", token);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(ARTICLE_ID, { title: "Updated" });
  });

  test("[Articles] Delete Article - Test Service Call", async () => {
    const spy = jest
      .spyOn(articlesService, "delete")
      .mockResolvedValue({ deletedCount: 1 });

    await request(app)
      .delete(`/api/articles/${ARTICLE_ID}`)
      .set("x-access-token", token);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(ARTICLE_ID);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockingoose.resetAll();
  });
});
