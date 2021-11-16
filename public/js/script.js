const article = document.querySelector('.grid');

const deleteUrl = '/admin/delete-product/';

if (article) {
  article.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
      const { id, csrf } = e.target.dataset;
      fetch(`${deleteUrl}${id}`, {
        method: 'DELETE',
        headers: {
          'csrf-token': csrf,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === 'DELETED')
            e.target.parentElement.parentElement.remove();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });
}
