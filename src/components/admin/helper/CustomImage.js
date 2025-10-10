import Image from '@tiptap/extension-image';

const CustomImage = Image.extend({
  name: 'customImage',

  parseHTML() {
    return [
      {
        tag: 'img[src]', // Cho phép parse thẻ <img> khi editor load HTML
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', HTMLAttributes]; // render lại thẻ <img> khi xuất HTML
  },
});

export default CustomImage;
