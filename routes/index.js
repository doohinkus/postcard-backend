const controllers = require('../controllers');

module.exports = (app) =>{

   app.route('/GalleryImages')
       .get(controllers.GalleryImages);
   
       
       app.route('/AddUser')
       .post(controllers.AddUser);
       
       app.route('/Login')
       .post(controllers.Login);
       
              
   app.route('/AddComment')
      .post(/*controllers.CheckAuth,*/ controllers.AddComment);

   app.route('/EditUser')
      .put(controllers.CheckAuth, controllers.EditUser);

   app.route('DeleteUser')
      .delete(controllers.CheckAuth, controllers.DeleteUser);


   app.route('/favicon.ico')
      .get(controllers.Favicon);

   app.route('/AddImage')
      .post(controllers.CheckAuth, controllers.UploadImage, controllers.AddImage);

   app.route('/PairUsers')
      .get(controllers.PairUsers);
}