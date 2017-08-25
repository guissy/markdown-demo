beforeAll(() => {
  const div = document.createElement('div');
  div.id = 'root';
  return document.body.appendChild(div);
});

test('index: #root', () => {
  require('./index');
  const root = document.querySelector('#root');
  expect(root.childNodes[0].textContent).toContain('react-empty');
});