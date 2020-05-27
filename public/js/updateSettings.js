import axios from 'axios';
import { showAlert } from './alerts';

//data is a object of all the data we want to update
//type is either password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'Password'
        ? 'http://localhost:3000/api/v1/users/updateMyPassword'
        : 'http://localhost:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'Success') {
      showAlert('success', `${type} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
