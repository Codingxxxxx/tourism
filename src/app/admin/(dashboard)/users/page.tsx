'use client';

import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Box, Button, Chip, MenuItem, Fade, Menu, ListItemIcon, ListItemText, Typography, Dialog, DialogTitle, DialogContent, Grid2 as Grid, FormGroup } from '@mui/material'
import { DialogsProvider, useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import { AddCircleOutline, ContentCopy, Delete, Edit, Menu as MenuIcon, Password, Security } from '@mui/icons-material';
import { type GridColDef, type GridPaginationModel } from '@mui/x-data-grid';
import Link from 'next/link';
import DataGrid from '@/components/datagrid/DataGrid';
import { MetaColumns } from '@/components/datagrid/defaultColumns';
import { Fragment, useActionState, useEffect, useState, useTransition } from "react";
import { PaginatedUsers } from "@/shared/types/serverActions";
import { getPageOffset } from '@/shared/utils/paginationUtils';
import { ServerResponse } from "@/shared/types/serverActions";
import { handleServerAction, withServerHandler } from "@/shared/utils/apiUtils";
import { changeUserPassword, deleteUser, getUsers } from '@/server/actions/user';
import { Role } from '@/shared/types/dto';
import { CustomBackdrop } from '@/components/Backdrop';
import Toast from '@/components/form/Toast';
import PopupState, { bindTrigger, bindMenu } from 'material-ui-popup-state';
import { useRouter } from 'next/navigation';
import { Form, Formik, FormikHelpers } from 'formik';
import CustomTextField from '@/components/form/CustomField';
import CustomErrorMessage from '@/components/form/ErrorMessage';
import * as Yub from 'yup';

type FormChangePasswordProps = {
  newPassword: string
}

type ChangePasswordDialogProps = {
  userId: string;
};

const changePasswordSchema = Yub.object({
  newPassword: Yub.string().required().min(8).label('New Password'),
  confirmNewPassword: Yub.string().required().label('Confirm New Password').oneOf([Yub.ref('newPassword')], 'Confirm New Password doesn\'t match').min(8),
})

function ChangePasswordDialog({ open, onClose, payload }: DialogProps<ChangePasswordDialogProps>) {
  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const initialValues: FormChangePasswordProps =  {
    newPassword: ''
  };

  const onSubmit = async (values: FormChangePasswordProps, helpers: FormikHelpers<FormChangePasswordProps>) => {
    try {
      setServerResponse(null);
      const result = await handleServerAction(() => changeUserPassword(payload.userId, values.newPassword, values.newPassword));
      setServerResponse(result);

      if (result.success) {
        helpers.resetForm()
      }
    } catch (err) {
      console.error(err);
      helpers.setSubmitting(false);
    }
  }

  return (
    <Dialog fullWidth open={open} onClose={() => onClose()}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
          <Formik initialValues={initialValues} validationSchema={changePasswordSchema} onSubmit={onSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <Grid container spacing={2} maxWidth='100%' marginX='auto' marginTop={4}>
                  <Grid size={12}>
                    {/* current password */}
                    <FormGroup>
                      <CustomTextField
                        id='newPassword'
                        label='New Password'
                        name='newPassword'
                        type='password'
                        required
                      />
                      <CustomErrorMessage name='newPassword' />
                    </FormGroup>
                  </Grid>
                  {/* confirm */}
                  <Grid size={12}>
                    {/* current password */}
                    <FormGroup>
                      <CustomTextField
                        id='confirmNewPassword'
                        label='Confirm New Password'
                        name='confirmNewPassword'
                        type='password'
                        required
                      />
                      <CustomErrorMessage name='confirmNewPassword' />
                    </FormGroup>
                  </Grid>
                  {/* button */}
                  <Grid size={12}>
                    <Button type="submit" fullWidth variant="contained" color="primary" loading={isSubmitting} size='large'>
                      sumit
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            )}
        </Formik>
      </DialogContent>
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
    </Dialog>
  )
}

export default function Page() {
  const initialState: ServerResponse<PaginatedUsers> = {
    data: {
      users: [],
      meta: {
        total: 0
      }
    }
  };
  const router = useRouter();

  const [serverResponse, setServerResponse] = useState<ServerResponse | null>();
  const [isPendingDelete, startTransition] = useTransition();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0
  });

  const dialog = useDialogs();

  const [stat, action] = useActionState(withServerHandler(getUsers), initialState);

  useEffect(() => {
    startTransition(() => {
      const offset = getPageOffset(paginationModel.page, paginationModel.pageSize);
      action({
        limit: paginationModel.pageSize,
        offset
      });
    });
  }, [paginationModel]);

  const onConfirmedDelete = (popupState: any, id: string) => {
    popupState.close();
    startTransition(async () => {
      setServerResponse(null);
      const res = await handleServerAction(() => deleteUser(id))

      if (res.success) setPaginationModel({
        pageSize: 10,
        page: 0
      })

      setServerResponse(res);
    });
  }

  const onChangePassword = async (popupState: any, id: string) => {
    popupState.close();
    await dialog.open(ChangePasswordDialog, {
      userId: id
    });
  }
  
  const onEdit = (popupState: any, id: string) => {
    popupState.close();
    router.push('/admin/users/edit/' + id);
  }

  const columns: GridColDef[] = [
    {
      field: 'username',
      headerName: 'Username'
    },
    {
      field: 'firstName',
      headerName: 'First Name'
    },
    {
      field: 'lastName',
      headerName: 'Last Name'
    },
    {
      field: 'email',
      headerName: 'Email'
    },
    {
      field: 'roles',
      headerName: 'Role',
      renderCell: ({ value }) => {
        if (!value) return;
        return (value as Role[] || []).map(role => <Chip label={role.name} variant='filled' />);
      }
    },
    ...MetaColumns,
    {
      field: 'id',
      headerName: 'Actions',
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        return (
          <PopupState variant="popover" popupId="demo-popup-menu">
          {(popupState) => (
            <>
              <Button color="warning" {...bindTrigger(popupState)}>
                <MenuIcon />
              </Button>
              <Menu {...bindMenu(popupState)}>
                <MenuItem
                  onClick={() => onEdit(popupState, value)}
                >
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => onChangePassword(popupState, value)}>
                  <ListItemIcon>
                    <Security fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Change Password</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => onConfirmedDelete(popupState, value)}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
          </PopupState>
        )
      },
      width: 100
    }
  ]

  return (
    <DashboardContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <Button variant='contained' size='large' sx={{ marginBottom: 2 }} LinkComponent={Link} href='users/new'>
          <AddCircleOutline sx={{ marginRight: 1 }} />
          new user
        </Button>
        <DataGrid 
          columns={columns} 
          rows={stat.data?.users}
          paginationMode='server'
          rowCount={stat.data?.meta?.total} 
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Box>
      {serverResponse && <Toast success={serverResponse.success} message={serverResponse.message} />}
      <CustomBackdrop open={isPendingDelete} />
    </DashboardContainer>
  )
} 