import * as functions from "firebase-functions";
import { User } from "./type/user";
import admin = require("firebase-admin");

// firebaseの初期化
admin.initializeApp();

exports.onUpdateUser = functions
  .region("asia-northeast1") // 対象のリージョン
  .firestore // 対象のサービス
  .document("users/{userId}") // 対象のドキュメント
  .onUpdate(async (change, context) => {
    const { userId } = context.params;
    const newUser = change.after.data() as User; // 更新後のUserData

    // DBの参照先を獲得
    const db = admin.firestore();
    try {
      // dbの中で書き換えたい元のレコードを探索
      const snapshot = await db
        .collectionGroup("reviews")
        .where("user.id", "==", userId)
        .get();

      // batch
      const batch = await db.batch();
      // updateするレコードを作成
      snapshot.docs.forEach((doc) => {
        const user = { ...doc.data().user, name: newUser.name };
        batch.update(doc.ref, { user });
      });
      // DBの更新
      await batch.commit();
    } catch (err) {
      console.log(err);
    }
  });
