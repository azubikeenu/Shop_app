// const updateForm = document.getElementById('update_form');
// const title = document.getElementById('title');
// const price = document.getElementById('price');
// const photo = document.getElementById('image');
// const description = document.getElementById('description');
// const id = new URLSearchParams(location.search).get('id');

// if (updateForm) {
//   updateForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('title', title.value);
//     formData.append('price', price.value);
//     formData.append('description', description.value);
//     formData.append('photo', photo.files[0]);
//     const endpoint = ` http://localhost:3000/admin/edit-product/${id}`;
//     try {
//       await axios({
//         method: 'PUT',
//         url: endpoint,
//         data: formData,
//       });
//     } catch (err) {
//       console.log(err);
//     }
//   });
// }
