// // utils/form.utils.ts

// export const toFormData = (data: Record<string, any>) => {
//   const formData = new FormData();

//   if (data.folderType) {
//     formData.append('folderType', data.folderType);
//   }

//   const files: { key: string; value: File }[] = [];

//   const appendData = (key: string, value: any) => {
//     // ВАЖЛИВО: Якщо це файл, додаємо його в чергу без модифікації ключа
//     if (value instanceof File) {
//       files.push({ key, value });
//     } else if (Array.isArray(value)) {
//       value.forEach((item, index) => {
//         // Якщо в масиві лежать ФАЙЛИ, ми не додаємо [index] до ключа
//         if (item instanceof File) {
//           files.push({ key, value: item });
//         } else {
//           appendData(`${key}[${index}]`, item);
//         }
//       });
//     } else if (value !== null && typeof value === 'object') {
//       Object.entries(value).forEach(([subKey, subValue]) => 
//         appendData(`${key}[${subKey}]`, subValue)
//       );
//     } else if (value !== undefined && value !== null) {
//       formData.append(key, value);
//     }
//   };

//   Object.entries(data).forEach(([key, value]) => {
//     if (key !== 'folderType') appendData(key, value);
//   });

//   // Додаємо файли. Тепер всі вони будуть під ключем 'files', а не 'files[0]'
//   files.forEach(({ key, value }) => {
//     formData.append(key, value);
//   });

//   return formData;
// };


// utils/form.utils.ts

export const toFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  const files: { key: string; value: File }[] = [];
  const displayNames: Record<string, string[]> = {}; // Для зберігання імен за ключами

  const appendData = (key: string, value: any) => {
    if (value instanceof File) {
      files.push({ key, value });
      
      // Зберігаємо кастомне ім'я, якщо воно є (наш CustomFile)
      if (!displayNames[key]) displayNames[key] = [];
      displayNames[key].push((value as any).displayName || value.name);

    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          files.push({ key, value: item });
          
          if (!displayNames[key]) displayNames[key] = [];
          displayNames[key].push((item as any).displayName || item.name);
        } else {
          appendData(`${key}[${index}]`, item);
        }
      });
    } else if (value !== null && typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) =>
        appendData(`${key}[${subKey}]`, subValue)
      );
    } else if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  };

  // Спочатку обробляємо folderType, якщо він є
  if (data.folderType) formData.append('folderType', data.folderType);

  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'folderType') appendData(key, value);
  });

  // Додаємо самі файли
  files.forEach(({ key, value }) => {
    formData.append(key, value);
  });

  // Додаємо кастомні імена як JSON-рядки для кожного ключа файлів
  Object.entries(displayNames).forEach(([key, names]) => {
    // Наприклад, для поля "files" створиться поле "files_names"
    formData.append(`${key}_names`, JSON.stringify(names));
  });

  return formData;
};